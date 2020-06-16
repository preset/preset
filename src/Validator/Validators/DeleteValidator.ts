import { Log, Color, DeleteActionContract, ContextContract } from '../../';
import { ValidatorContract } from '../';

export class DeleteValidator implements ValidatorContract<DeleteActionContract> {
  async validate(
    action: Partial<DeleteActionContract>,
    context: ContextContract
  ): Promise<DeleteActionContract | never> {
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
