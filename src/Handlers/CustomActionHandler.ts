import { injectable } from 'inversify';
import { ActionHandlerContract, ContextContract, CustomActionContract } from '@/Contracts';
import { Log } from '@/Logger';

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
      Log.warn(`A custom action did not perform correctly.`);
      Log.debug(error);
    }

    return false;
  }
}
