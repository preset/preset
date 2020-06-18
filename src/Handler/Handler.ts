import { DeleteHandler, CopyHandler } from './';
import { Action, ContextContract, Log, Color } from '../';
import { UpdateJsonFileHandler } from './Handlers';

/**
 * A handler that takes an action and executes it.
 */
export class Handler {
  private static handlers = {
    none: () => {},
    copy: CopyHandler,
    delete: DeleteHandler,
    'update-json-file': UpdateJsonFileHandler,
  };

  /**
   * Handles the given action. Returns false if the action did not execute.
   */
  static async handle(action: Partial<Action>, context: ContextContract): Promise<boolean | never> {
    if (!action.type || !(action.type in this.handlers)) {
      return Log.exit(`Invalid action of ${Color.keyword(action.type ?? 'undefined')} type.`);
    }

    let shouldPerformAction = true;

    if (typeof action.if === 'function') {
      shouldPerformAction = action.if();
    }

    if (typeof action.if !== 'undefined') {
      shouldPerformAction = !!action.if;
    }

    if (!shouldPerformAction) {
      Log.debug(`An action did not met its defined conditions. Skipping.`);
      return false;
    }

    // @ts-expect-error
    await new this.handlers[action.type]().handle(action, context);

    return true;
  }
}
