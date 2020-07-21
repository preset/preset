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
} from '@/Contracts';
import { Binding, container } from '@/Container';
import fs from 'fs-extra';
import { Listr, ListrTask } from 'listr2';

import { Log, Color } from '@/Logger';

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

  @inject(Binding.Tasks)
  private tasks!: Listr<ApplicationContextContract>;

  async run(applierOptions: ApplierOptionsContract): Promise<boolean> {
    this.tasks.add([
      {
        title: 'Resolve preset',
        task: async (local, task) => {
          // Tries to resolve the given path/name/whatever
          const result = await this.resolvePreset(applierOptions.resolvable);

          if (!result) {
            return task.skip('Could not resolve the preset.');
          }

          local.resolverResult = result;
        },
      },
    ]);

    this.tasks.add({
      title: 'Parse preset',
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

        local.context = context;
      },
    });

    this.tasks.add({
      title: 'Execute global before hook',
      task: async ({ context }, task) => {
        context.task = task;

        const before = await this.applyGlobalHook('before', context);
        if (!before) {
          task.skip('No hook defined');
        }
      },
    });

    this.tasks.add({
      title: 'Execute actions',
      task: async ({ context }, task) => {
        context.task = task;

        if (!context.generator.actions || typeof context.generator.actions !== 'function') {
          return task.skip('No action to execute');
        }

        return new Listr(await this.getActionList(context));
      },
    });

    this.tasks.add({
      title: 'Execute global after hook',
      task: async ({ context }, task) => {
        context.task = task;

        const after = await this.applyGlobalHook('after', context);

        if (!after) {
          task.skip('No hook defined');
        }
      },
    });

    this.tasks.add({
      title: 'Delete temporary directory',
      task: async ({ context }) => {
        await this.deleteTemporaryFolder(context);
      },
    });

    await this.tasks.run();

    // Log a success message
    // Log.success(`Applied preset ${Color.preset(context.presetName)}.`);

    return true;
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
        exitOnError: false,
      });

      subtasks.add({
        title: 'Validating action.',
        task: async (local, task) => {
          // Tries to get a handler for that action. This is wrapped in a function because I didn't
          // want to use let, I wanted a const. Am I sick? Yes.
          const handler = (() => {
            try {
              return container.getNamed<ActionHandlerContract>(Binding.Handler, raw.type);
            } catch (error) {
              throw new Error(`Could not find a handler for an action of type ${Color.keyword(raw.type)}.`);
            }
          })();

          // If we got false we don't have a handler.
          if (!handler) {
            return task.skip(`Invalid action type, "${raw.type}".`);
          }

          // Validates the action.
          const action = await handler.validate(raw);
          if (!action) {
            return task.skip(`Validation failed.`);
          }

          // Checks if the action should actually run
          // TODO - test
          if (!(await this.shouldRun(action, local.context))) {
            local.skip = true;
            return task.skip(`Condition unmet`);
          }

          local.handler = handler;
          local.action = action;
        },
      });

      subtasks.add({
        title: 'Execute before hooks',
        enabled: ({ skip }) => !skip,
        task: async ({ action, context }, task) => {
          context.task = task;

          task.output = 'Executing global beforeEach hook...';
          const beforeEach = await this.applyGlobalHook('beforeEach', context);

          task.output = 'Executing local before hook...';
          const before = await this.applyActionHook('before', action, context);

          if (!beforeEach && !before) {
            task.skip('No before hook defined');
          }
        },
      });

      subtasks.add({
        title: 'Executing action.',
        enabled: ({ skip }) => !skip,
        task: async ({ handler, action, context }, task) => {
          // Updates the nested task context
          context.task = task;

          const success = await handler.handle(action, context);

          if (!success) {
            throw new Error('Failed to execute.');
          }
        },
      });

      subtasks.add({
        title: 'Execute after hooks',
        enabled: ({ skip }) => !skip,
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
        title: raw.title ?? raw.type,
        task: async () => subtasks,
      });
    }

    return tasks;
  }

  /**
   * Deletes the temporary folder if needed.
   */
  private async deleteTemporaryFolder(context: ContextContract): Promise<boolean> {
    if (!context.temporary) {
      return true;
    }

    try {
      Log.debug(`Removing temporary directory ${Color.directory(context.presetDirectory)}`);
      fs.removeSync(context.presetDirectory);
    } catch (error) {
      throw new Error('Could not delete the temporary folder.');
      // Log.debug(error);
      // return false;
    }

    return true;
  }

  /**
   * Checks if an action should run.
   */
  private async shouldRun(action: Partial<BaseActionContract<any>>, context: ContextContract): Promise<boolean> {
    // Check for action conditions
    if (typeof action.if === 'function') {
      return await action.if(context);
    }

    if (typeof action.if === 'undefined') {
      return true;
    }

    if (!Array.isArray(action.if)) {
      action.if = [typeof action.if === undefined ? true : false];
    }

    return action.if.every(condition => Boolean(condition));
  }

  private async applyGlobalHook(
    id: 'before' | 'after' | 'beforeEach' | 'afterEach',
    context: ContextContract
  ): Promise<boolean> {
    const hook = context?.generator[id];
    if (!hook || typeof hook !== 'function') {
      return false;
    }

    return this.applyHook(id, hook, context);
  }

  private async applyActionHook(
    id: 'before' | 'after',
    action: BaseActionContract<any>,
    context: ContextContract
  ): Promise<boolean> {
    const hook = action[id];
    if (!hook || typeof hook !== 'function') {
      return false;
    }

    return this.applyHook(id, hook, context);
  }

  private async applyHook(id: string, hook: Function, context: ContextContract): Promise<boolean> {
    try {
      await hook(context);
    } catch (error) {
      throw new Error(`Hook ${Color.keyword(id)} failed to execute.`);
    }

    return true;
  }
}
