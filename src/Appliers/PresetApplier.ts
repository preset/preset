import { injectable, inject } from 'inversify';
import {
  ApplierContract,
  ResolverContract,
  ParserContract,
  BaseActionContract,
  ActionHandlerContract,
  ContextContract,
} from '@/Contracts';
import { Binding, container } from '@/Container';
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

  async run(resolvable: string, argv: string[], debug: boolean): Promise<boolean> {
    // Tries to resolve the given path/name/whatever
    const result = await this.resolver.resolve(resolvable);

    // Instantly leave if the resolvable couldn't be resolved
    if (!result || !result.success || !result.path) {
      return false;
    }

    // Parses the preset
    const context = await this.parser.parse(result.path, {
      argv,
      temporary: !!result?.temporary,
    });

    // If no context is returned we're out
    if (!context) {
      Log.debug(`Could not parse ${Color.file(resolvable)}.`);
      return false;
    }

    // Apply "before"" execution hook
    this.applyHook('before', context);

    // Loops through the action, validate and execute them
    const actions = (typeof context.generator.actions === 'function' //
      ? context.generator.actions(context)
      : context.generator.actions) as BaseActionContract<any>[];

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
        continue; // TODO - Give the choice to abort?
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

    // Apply "after" execution hook
    this.applyHook('after', context);

    return true;
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
