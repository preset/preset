import { ContextContract } from '../..';

export interface HandlerContract<T> {
  handle(action: Partial<T>, context: ContextContract): Promise<void | never>;
}
