import { Log, Color, CopyAction, ContextContract, copyConflictStrategies } from '../../';
import { ValidatorContract } from '../';

export class CopyValidator implements ValidatorContract<CopyAction> {
  async validate(action: Partial<CopyAction>, context: ContextContract): Promise<CopyAction | never> {
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
