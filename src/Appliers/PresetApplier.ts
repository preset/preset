import { injectable, inject } from 'inversify';
import {
  ApplierContract,
  ResolverContract,
  ParserContract,
  BaseActionContract,
  ActionHandlerContract,
  ContextContract,
  ApplierOptionsContract,
  ResolverResultContract,
  ApplicationContextContract,
  ActionContextContract,
  HookFunction,
} from '@/Contracts';
import { Binding, container } from '@/Container';
import { Listr, ListrTask } from 'listr2';
import { Logger } from '@/Logger';
import fs from 'fs-extra';

/**
 * Tries to resolve the given resolvable to a preset.
 * If found, applies it to the current context.
 */
@injectable()
export class PresetApplier implements ApplierContract {
  @inject(Binding.Resolver)
  private resolver!: ResolverContract;

  @inject(Binding.Parser)
  private parser!: ParserContract;

  async run(applierOptions: ApplierOptionsContract): Promise<ListrTask<ApplicationContextContract>[]> {
    Logger.info(`Running applier with ${JSON.stringify(applierOptions)}`);
    const tasks: ListrTask<ApplicationContextContract>[] = [];

    tasks.push({
      title: 'Resolve',
      task: async (local, task) => {
        // Tries to resolve the given path/name/whatever
        const result = await this.resolvePreset(applierOptions.resolvable);

        if (!result) {
          return task.skip('Could not resolve the preset.');
        }

        local.resolverResult = result;
      },
    });

    tasks.push({
      title: 'Parse',
      task: async local => {
        const { resolverResult } = local;

        // Parses the preset
        const context = await this.parser.parse(resolverResult.path!, {
          applierOptions,
          temporary: !!resolverResult?.temporary,
        });

        // If no context is returned we're out
        if (!context) {
          throw new Error('Could not generate the preset context.');
        }

        Logger.info(
          `Current context is ${JSON.stringify({
            args: context.args,
            argv: context.argv,
            debug: context.debug,
            flags: context.flags,
            prompts: context.prompts,
          })}`
        );

        local.context = context;
      },
    });

    tasks.push({
      title: 'Execute "before" hook',
      enabled: async ({ context }) => Boolean(await this.getGlobalHook('before', context)),
      task: async ({ context }, task) => {
        context.task = task;

        const before = await this.applyGlobalHook('before', context);
        if (!before) {
          task.skip('No hook defined');
        }
      },
    });

    tasks.push({
      task: async ({ context }, task) => {
        task.title = `Apply ${context.presetName}`;
        context.task = task;

        if (!context.generator.actions || typeof context.generator.actions !== 'function') {
          return task.skip('No action to execute');
        }

        return task.newListr(await this.getActionList(context), {
          rendererOptions: {
            collapse: false,
          },
        });
      },
    });

    tasks.push({
      title: 'Execute "after" hook',
      enabled: async ({ context }) => Boolean(await this.getGlobalHook('after', context)),
      task: async ({ context }, task) => {
        context.task = task;

        const after = await this.applyGlobalHook('after', context);

        if (!after) {
          task.skip('No hook defined');
        }
      },
    });

    tasks.push({
      title: 'Clean up temporary files',
      task: async ({ context }, task) => {
        if (!context.temporary) {
          return task.skip('Delete temporary directory');
        }

        await this.deleteTemporaryFolder(context);
      },
    });

    return tasks;
  }

  private async resolvePreset(resolvable: string): Promise<ResolverResultContract | false> {
    // Tries to resolve the given path/name/whatever
    const result = await this.resolver.resolve(resolvable);

    // Instantly leave if the resolvable couldn't be resolved
    if (!result || !result.success || !result.path) {
      return false;
    }

    return result;
  }

  private async getActionList(context: ContextContract): Promise<ListrTask<ApplicationContextContract>[]> {
    const tasks: ListrTask<ApplicationContextContract>[] = [];

    // Get the actions
    const actions = await (context.generator.actions as Function)(context);

    // Loops through the action, validate and execute them
    for (const raw of actions) {
      const subtasks = new Listr<ActionContextContract>([], {
        ctx: <ActionContextContract>{
          context,
          skip: false,
        },
        concurrent: false,
        exitOnError: true,
        rendererOptions: {
          collapse: !context.debug,
          showSubtasks: context.debug,
          collapseSkips: !context.debug,
          clearOutput: !context.debug,
        },
      });

      subtasks.add({
        title: 'Validate',
        task: async (local, task) => {
          // Reset the skip context
          local.skip = false;

          // Tries to get a handler for that action. This is wrapped in a function because I didn't
          // want to use let, I wanted a const. Am I sick? Yes.
          const handler = (() => {
            try {
              return container.getNamed<ActionHandlerContract>(Binding.Handler, raw.type);
            } catch (error) {
              throw new Error(`Could not find a handler for an action of type ${raw.type}.`);
            }
          })();

          // If we got false we don't have a handler.
          if (!handler) {
            local.skip = true;
            return task.skip(`Invalid action type, "${raw.type}".`);
          }

          // Validates the action.
          const action = await handler.validate(raw, local.context);

          if (!action) {
            local.skip = true;
            return task.skip(`Validation failed.`);
          }

          // Checks if the action should actually run
          if (!Boolean(await this.shouldRun(action, local.context))) {
            local.skip = true;
            return task.skip(`Condition unmet`);
          }

          local.handler = handler;
          local.action = action;
        },
      });

      subtasks.add({
        title: 'Execute "before" hooks',
        enabled: async ({ skip, context, action }) => {
          return (await this.hasBeforeHook(context, action)) && !skip;
        },
        task: async ({ action, context }, task) => {
          context.task = task;

          task.output = 'Executing global beforeEach hook...';
          const beforeEach = await this.applyGlobalHook('beforeEach', context);

          task.output = 'Executing local before hook...';
          const before = await this.applyActionHook('before', action, context);

          if (!beforeEach && !before) {
            return task.skip('No before hook defined');
          }
        },
      });

      subtasks.add({
        title: 'Execute',
        enabled: ({ skip }) => !skip,
        options: {
          persistentOutput: true,
        } as any,
        task: async (local, task) => {
          const { context, handler, action } = local;
          Logger.info(
            `Executing: ${JSON.stringify(action)} with ${JSON.stringify({
              args: context.args,
              argv: context.argv,
              debug: context.debug,
              flags: context.flags,
              prompts: context.prompts,
            })}`
          );

          // Updates the nested task context
          context.task = task;

          // Get the result from the handler
          const result = await handler.handle(action, context);

          // Handle skip
          if (result?.reason) {
            local.skip = true;
            return task.skip(result?.reason ?? 'Handling skipped');
          }

          // Handle fail
          if (result?.success === false) {
            throw new Error('Failed to execute.');
          }

          // Handle new tasks
          if (Array.isArray(result.tasks)) {
            return new Listr(result.tasks);
          }

          return true;
        },
      });

      subtasks.add({
        title: 'Execute "after" hooks',
        enabled: async ({ skip, context, action }) => {
          return (await this.hasAfterHook(context, action)) && !skip;
        },
        task: async ({ action, context }, task) => {
          context.task = task;

          task.output = 'Applying local after hook...';
          const after = await this.applyActionHook('after', action, context);

          task.output = 'Applying global afterEach hook...';
          const afterEach = await this.applyGlobalHook('afterEach', context);

          if (!afterEach && !after) {
            task.skip('No after hook defined');
          }
        },
      });

      tasks.push({
        title: this.getActionFriendlyNameByType(raw),
        task: async () => subtasks,
        options: {
          persistentOutput: true,
        },
      });
    }

    return tasks;
  }

  private getActionFriendlyNameByType(action: BaseActionContract<any>): string {
    if (action.title) {
      return action.title;
    }

    const map: { [str: string]: string } = {
      copy: 'Copy files or directories',
      custom: 'Execute custom code',
      delete: 'Delete files or directories',
      edit: 'Edit file',
      'edit-json': 'Edit JSON file',
      preset: 'Apply external preset',
      prompt: 'Ask for information',
      'install-dependencies': 'Install dependencies',
    };

    if (Reflect.has(map, action.type)) {
      return map[action.type];
    }

    return action.type;
  }

  /**
   * Deletes the temporary folder if needed.
   */
  private async deleteTemporaryFolder(context: ContextContract): Promise<boolean> {
    if (!context.temporary) {
      return true;
    }

    try {
      Logger.info(`Removing temporary directory ${context.presetDirectory}`);
      fs.removeSync(context.presetDirectory);
    } catch (error) {
      throw Logger.throw('Could not delete the temporary folder', error);
    }

    return true;
  }

  /**
   * Checks if an action should run.
   */
  private async shouldRun(action: Partial<BaseActionContract<any>>, context: ContextContract): Promise<boolean> {
    if (typeof action.if === 'undefined') {
      return true;
    }

    if (typeof action.if === 'function') {
      action.if = Boolean(await action.if(context));
    }

    if (!Array.isArray(action.if)) {
      action.if = [typeof action.if === undefined ? true : Boolean(action.if)];
    }

    return action.if.every(condition => Boolean(condition));
  }

  private async hasBeforeHook(context: ContextContract, action: BaseActionContract<any>): Promise<boolean> {
    const hasBefore = await this.getActionHook('before', action);
    const hasBeforeEach = await this.getGlobalHook('beforeEach', context);

    return Boolean(hasBefore) || Boolean(hasBeforeEach);
  }

  private async hasAfterHook(context: ContextContract, action: BaseActionContract<any>): Promise<boolean> {
    const hasAfter = await this.getActionHook('after', action);
    const hasAfterEach = await this.getGlobalHook('afterEach', context);

    return Boolean(hasAfter) || Boolean(hasAfterEach);
  }

  private async getGlobalHook(
    id: 'before' | 'after' | 'beforeEach' | 'afterEach',
    context: ContextContract
  ): Promise<HookFunction | false> {
    if (!Reflect.has(context?.generator ?? {}, id)) {
      return false;
    }

    const hook = context?.generator[id];

    if (!hook || typeof hook !== 'function') {
      return false;
    }

    return hook;
  }

  private async applyGlobalHook(
    id: 'before' | 'after' | 'beforeEach' | 'afterEach',
    context: ContextContract
  ): Promise<boolean> {
    const hook = await this.getGlobalHook(id, context);

    if (!hook) {
      return false;
    }

    return this.applyHook(id, hook, context);
  }

  private async getActionHook(id: 'before' | 'after', action: BaseActionContract<any>): Promise<HookFunction | false> {
    if (!Reflect.has(action ?? {}, id)) {
      return false;
    }

    const hook = action[id];

    if (!hook || typeof hook !== 'function') {
      return false;
    }

    return hook;
  }

  private async applyActionHook(
    id: 'before' | 'after',
    action: BaseActionContract<any>,
    context: ContextContract
  ): Promise<boolean> {
    const hook = await this.getActionHook(id, action);

    if (!hook) {
      return false;
    }

    return this.applyHook(id, hook, context);
  }

  private async applyHook(id: string, hook: Function, context: ContextContract): Promise<boolean> {
    try {
      await hook(context);
    } catch (error) {
      throw new Error(`Hook ${id} failed to execute.`);
    }

    return true;
  }
}
