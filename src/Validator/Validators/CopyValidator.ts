import { Log, Color, CopyActionContract, ContextContract, copyConflictStrategies } from '../../';
import { ValidatorContract } from '../';

export class CopyValidator implements ValidatorContract<CopyActionContract> {
  async validate(action: Partial<CopyActionContract>, context: ContextContract): Promise<CopyActionContract | never> {
    if (action.strategy && !copyConflictStrategies.includes(action.strategy)) {
      Log.warn(`Unknown strategy ${Color.keyword(action.strategy)} for a ${Color.keyword('copy')} action.`);
      action.strategy = 'ask';
    }

    return {
      files: '*',
      target: '',
      strategy: 'ask',
      ...action,
      type: 'copy',
    };
  }
}
