import { injectable } from 'inversify';
import { ActionHandlerContract, CopyActionContract, BaseActionContract, copyConflictStrategies } from '@/Contracts';
import { Log, Color } from '@/Logger';
import { tagProperty } from 'inversify/dts/annotation/decorator_utils';

@injectable()
export class CopyActionHandler implements ActionHandlerContract<'copy'> {
  for = 'copy' as const;

  async validate(action: Partial<CopyActionContract>): Promise<CopyActionContract> {
    // Resolves strategy as a callable
    if (typeof action.strategy === 'function') {
      action.strategy = (<Function>action.strategy)();
    }

    // Ensures the strategy is known
    if (action.strategy && !copyConflictStrategies.includes(action.strategy)) {
      Log.warn(`Unknown strategy ${Color.keyword(action.strategy)} for a ${Color.keyword(this.for)} action.`);
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

  async handle(action: CopyActionContract): Promise<CopyActionContract> {
    throw new Error('Method not implemented.');
  }
}
