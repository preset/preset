import { DeleteHandler, CopyHandler } from './';
import { Action, ContextContract, Log, Color } from '../';
import { UpdateJsonFileHandler } from './Handlers';

/**
 * A handler that takes an action and executes it.
 */
export class Handler {
  private static handlers = {
    copy: CopyHandler,
    delete: DeleteHandler,
    'update-json-file': UpdateJsonFileHandler,
  };

  /**
   * Handles the given action.
   */
  static async handle(action: Partial<Action>, context: ContextContract): Promise<void | never> {
    if (!action.type || !(action.type in this.handlers)) {
      return Log.exit(`Invalid action of ${Color.keyword(action.type ?? 'undefined')} type.`);
    }

    // @ts-expect-error
    await new this.handlers[action.type]().handle(action, context);
  }
}
