import { Log, Color, UpdateJsonFileActionContract, ContextContract, copyConflictStrategies } from '../../';
import { ValidatorContract } from '../';

export class UpdateJsonFileValidator implements ValidatorContract<UpdateJsonFileActionContract> {
  async validate(
    action: Partial<UpdateJsonFileActionContract>,
    context: ContextContract
  ): Promise<UpdateJsonFileActionContract | never> {
    if (!action.target) {
      return Log.exit(`No ${Color.keyword('target')} specified for the ${Color.keyword('update-json-file')} action.`);
    }

    return {
      strategy: 'create',
      ...action,
      target: action.target,
      type: 'update-json-file',
    };
  }
}
