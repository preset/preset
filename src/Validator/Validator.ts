import { Action, ContextContract, Log, Color } from '../';
import { CopyValidator, DeleteValidator, UpdateJsonFileValidator, ValidatorContract } from './';

/**
 * A validator that takes an action and validates it against its assigned validator.
 */
export class Validator {
  private static validators = {
    copy: CopyValidator,
    delete: DeleteValidator,
    'update-json-file': UpdateJsonFileValidator,
  };

  /**
   * Validates the given action.
   */
  static async validate(action: Partial<Action>, context: ContextContract): Promise<Action | never> {
    if (!action.type || !(action.type in this.validators)) {
      return Log.exit(`Invalid action of ${Color.keyword(action.type ?? 'undefined')} type.`);
    }

    // @ts-expect-error
    return await new this.validators[action.type]().validate(action, context);
  }
}
