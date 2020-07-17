import { BaseActionContract } from './Actions/ActionContract';
import { ContextContract } from './ContextContract';

export interface ActionHandlerContract<T = any> {
  for: T;
  validate(action: Partial<BaseActionContract<T>>): Promise<BaseActionContract<T> | false>;
  handle(action: BaseActionContract<T>, context: ContextContract): Promise<boolean>;
}
