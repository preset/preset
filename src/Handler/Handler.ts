import { PromptHandler, DeleteHandler, CopyHandler, UpdateJsonFileHandler, NullHandler } from './';
import { Action, ContextContract, Log, Color } from '../';

/**
 * A handler that takes an action and executes it.
 */
export class Handler {
  private static handlers = {
    none: NullHandler,
    copy: CopyHandler,
    delete: DeleteHandler,
    'update-json-file': UpdateJsonFileHandler,
    prompt: PromptHandler,
  };

  /**
   * Handles the given action. Returns false if the action did not execute.
   */
  static async handle(action: Partial<Action>, context: ContextContract): Promise<boolean | never> {
    if (!action.type || !(action.type in this.handlers)) {
      return Log.exit(`Invalid action of ${Color.keyword(action.type ?? 'undefined')} type.`);
    }

    // Checks if action should run.
    if (!this.shouldRun(action)) {
      return false;
    }

    // Execute before hooks
    await Log.multiple('info', action.before);

    // Executes the action
    // @ts-expect-error
    await new this.handlers[action.type]().handle(action, context);

    // Execute before hooks
    await Log.multiple('info', action.after);

    return true;
  }

  /**
   * Checks if an action should run.
   */
  private static shouldRun(action: Partial<Action>): boolean {
    // Check for action conditions
    if (!Array.isArray(action.if)) {
      action.if = [action.if ?? true];
    }

    const shouldPerformAction = action.if.every(condition => {
      if (typeof condition === 'function') {
        return condition();
      }

      if (typeof condition !== 'undefined') {
        return !!condition;
      }

      return true;
    });

    if (!shouldPerformAction) {
      Log.debug(`An action did not met its defined conditions. Skipping.`);
      return false;
    }

    return true;
  }
}
