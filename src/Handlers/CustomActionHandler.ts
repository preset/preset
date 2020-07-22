import { injectable } from 'inversify';
import { ActionHandlerContract, ContextContract, CustomActionContract } from '@/Contracts';
import { Logger } from '@/Logger';

@injectable()
export class CustomActionHandler implements ActionHandlerContract<'custom'> {
  for = 'custom' as const;

  async validate(action: Partial<CustomActionContract>): Promise<CustomActionContract> {
    return {
      ...action,
      execute: action.execute ?? (async () => true),
      type: 'custom',
    };
  }

  async handle(action: CustomActionContract, context: ContextContract): Promise<boolean> {
    try {
      return false !== (await action.execute(context));
    } catch (error) {
      throw Logger.throw('Custom action failed', error);
    }
  }
}
