import { injectable } from 'inversify';
import { ActionHandlerContract, ContextContract, CustomActionContract } from '@/Contracts';
import { Logger } from '@/Logger';
import { contextualize } from '.';

@injectable()
export class CustomActionHandler implements ActionHandlerContract<'custom'> {
  for = 'custom' as const;

  async validate(action: Partial<CustomActionContract>, context: ContextContract): Promise<CustomActionContract> {
    action = contextualize(action, context);

    return {
      ...action,
      execute: action.execute ?? (async () => true),
      type: 'custom',
    };
  }

  async handle(action: CustomActionContract, context: ContextContract) {
    try {
      return {
        success: false !== (await action.execute(context)),
      };
    } catch (error) {
      throw Logger.throw('Custom action failed', error);
    }
  }
}
