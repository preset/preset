import { BaseActionContract } from './Actions/ActionContract';
import { ContextContract } from './ContextContract';
import { ApplicationContextContract } from './TaskContract';
import { ListrTask } from 'listr2';

export interface ActionHandlerContract<T = any> {
  for: T;
  validate(action: Partial<BaseActionContract<T>>): Promise<BaseActionContract<T> | false>;
  handle(
    action: BaseActionContract<T>,
    context: ContextContract
  ): Promise<boolean | ListrTask<ApplicationContextContract>[]>;
}
