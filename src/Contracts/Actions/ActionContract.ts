import { ContextContract } from '../ContextContract';
import { HookFunction } from '../GeneratorContract';

/**
 * An action.
 */
export interface BaseActionContract<T> {
  /**
   * The type of action to create. This is required.
   */
  type: T;

  /**
   * Executes the action only if the given conditions are met.
   */
  if?: Condition;

  /**
   * A function to be executed before the action starts.
   */
  before?: HookFunction;

  /**
   * A function to be executed after the action starts.
   */
  after?: HookFunction;
}

type Condition = boolean | boolean[] | ((context: ContextContract) => Promise<boolean>);
