import { Log, ActionContract, ContextContract } from '../../';
import { HandlerContract } from '../';

export class NullHandler implements HandlerContract<ActionContract<'none'>> {
  async handle(action: ActionContract<'none'>, context: ContextContract): Promise<void | never> {
    Log.debug(`A null action ran.`);
  }
}
