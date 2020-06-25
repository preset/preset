import { injectable, inject } from 'inversify';
import {
  ApplierContract,
  ResolverContract,
  ParserContract,
  BaseActionContract,
  ActionHandlerContract,
  ContextContract,
  ApplierOptionsContract,
} from '@/Contracts';
import { Binding, container } from '@/Container';
import { Log, Color } from '@/Logger';
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

  async run(applierOptions: ApplierOptionsContract): Promise<boolean> {
    // Tries to resolve the given path/name/whatever
    const result = await this.resolver.resolve(applierOptions.resolvable);

    // Instantly leave if the resolvable couldn't be resolved
    if (!result || !result.success || !result.path) {
      return false;
    }

    // Parses the preset
    const context = await this.parser.parse(result.path, {
      applierOptions,
      temporary: !!result?.temporary,
    });

    // If no context is returned we're out
    if (!context) {
      Log.debug(`Could not generate context for ${Color.file(applierOptions.resolvable)}.`);
      return false;
    }

    // Apply "before"" execution hook
    this.applyHook('before', context);

    // Ensure we have actions
    if (!context.generator.actions || typeof context.generator.actions !== 'function') {
      Log.debug(`Preset ${Color.preset(context.presetName)} has no action to execute.`);
    } else {
      await this.applyActions(context);
    }

    // Apply "after" execution hook
    this.applyHook('after', context);

    // Log a success message
    Log.success(`Applied preset ${Color.preset(context.presetName)}.`);

    // Delete temporary folder
    await this.deleteTemporaryFolder(context);

    return true;
  }

  private async applyActions(context: ContextContract): Promise<boolean> {
    // Get the actions
    const actions = await (context.generator.actions as Function)(context);

    // Loops through the action, validate and execute them
    for (const raw of actions) {
      // Tries to get a handler for that action. This is wrapped in a function because I didn't
      // want to use let, I wanted a const. Am I sick? Yes.
      const handler = (() => {
        try {
          return container.getNamed<ActionHandlerContract>(Binding.Handler, raw.type);
        } catch (error) {
          Log.debug(`Could not find a handler for an action of type ${Color.keyword(raw.type)}.`);
          Log.debug(error);
        }

        return false;
      })();

      // If we got false we don't have a handler.
      if (!handler) {
        Log.warn(`Skipping an unknown action of type ${Color.keyword(raw.type)}.`);
        continue;
      }

      // Validates the action.
      const action = await handler.validate(raw);
      if (!action) {
        Log.debug(`Action could not be validated. Skipping.`);
        continue; // TODO - Give the choice to abort?
      }

      // Checks if the action should actually run
      // TODO - test
      if (!(await this.shouldRun(action, context))) {
        Log.debug(`Action did not met its defined conditions. Skipping.`);
        continue;
      }

      // Apply "beforeEach" execution hook
      this.applyHook('beforeEach', context);

      // Handles
      const success = await handler.handle(action, context);
      if (!success) {
        Log.debug(`Failed at handling a ${Color.keyword(action.type)} action.`);
      }

      // Apply "afterEach" execution hook
      this.applyHook('afterEach', context);
    }

    return true;
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
      Log.debug(error);
      return false;
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

  /**
   * Apply an execution hook.
   *
   * @param id The hook to apply.
   * @param context The current context.
   */
  private async applyHook(
    id: 'before' | 'after' | 'beforeEach' | 'afterEach',
    context: ContextContract
  ): Promise<boolean> {
    const hook = context?.generator[id];
    if (!hook || typeof hook !== 'function') {
      return true;
    }

    try {
      if (false !== (await hook(context))) {
        return true;
      }
    } catch (error) {
      Log.warn(`${Color.keyword(id)} execution hook failed to execute.`);
      Log.debug(error);
    }

    return true;
  }
}
