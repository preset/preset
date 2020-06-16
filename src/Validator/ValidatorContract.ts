import { Action, ContextContract } from '../';

export interface ValidatorContract {
  validate(action: Partial<Action>, context: ContextContract): Promise<Action | never>;
}
