import { BaseActionContract } from './Actions/ActionContract';

export interface ActionHandlerContract<T = any> {
  for: T;
  validate(action: Partial<BaseActionContract<T>>): Promise<BaseActionContract<T>>;
  handle(action: BaseActionContract<T>): Promise<BaseActionContract<T>>;
}
