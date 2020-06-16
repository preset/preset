import { Log, Color, DeleteAction, ContextContract } from '../../';
import { ValidatorContract } from '../';

export class DeleteValidator implements ValidatorContract<DeleteAction> {
  async validate(action: Partial<DeleteAction>, context: ContextContract): Promise<DeleteAction | never> {
    if (!action.files) {
      Log.debug(`A ${Color.keyword('delete')} action has no files specified.`);
      action.files = [];
    }

    return {
      ...action,
      files: action.files,
      type: 'delete',
    };
  }
}
