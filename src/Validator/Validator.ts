import { Action, ContextContract, Log, Color } from '../';
import { CopyValidator } from './Validators';

/**
 * A validator that takes an action and validates it against its assigned validator.
 */
export class Validator {
  private static validators = {
    copy: CopyValidator,
    delete: CopyValidator,
    'update-json-file': CopyValidator,
  };

  /**
   * Validates the given action.
   */
  static async validate(action: Partial<Action>, context: ContextContract): Promise<Action | never> {
    if (!action.type || !(action.type in this.validators)) {
      return Log.exit(`Invalid action of ${Color.keyword(action.type ?? 'undefined')} type.`);
    }

    return new this.validators[action.type]().validate(action, context);
  }
}

export abstract class AbstractValidator<T extends Action> {
  constructor(protected action: Partial<T>, protected context: ContextContract) {}

  protected async validate(): Promise<T | false> {
    throw new Error('This method should be implemented.');
  }
}
