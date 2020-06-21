import { injectable, inject } from 'inversify';
import {
  ApplierContract,
  ResolverContract,
  ParserContract,
  BaseActionContract,
  ActionHandlerContract,
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

    //
    if (!context) {
      Log.debug(`Could not parse ${Color.file(resolvable)}.`);
      return false;
    }

    // Loops through the action, validate and execute them
    const actions = (typeof context.generator.actions === 'function' //
      ? context.generator.actions(context)
      : context.generator.actions) as BaseActionContract<any>[];

    for (const raw of actions) {
      Log.debug(`Getting a ${Color.keyword(raw.type)} action's handler.`);
      const handler = container.getNamed<ActionHandlerContract>(Binding.Handler, raw.type);

      // Validates
      const action = await handler.validate(raw);
      if (!action) {
        continue; // TODO - Give the choice to abort?
      }

      // Handles
      const success = await handler.handle(action, context);
      if (!success) {
        Log.debug(`Failed at handling a ${Color.keyword(action.type)} action.`);
      }
    }

    console.log({
      resolvable,
      context,
      argv,
      debug,
      result,
    });

    return true;
  }
}
