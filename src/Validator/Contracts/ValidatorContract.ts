import { Action, ContextContract } from '../..';

export interface ValidatorContract<T> {
  validate(action: Partial<T>, context: ContextContract): Promise<T | never>;
}
