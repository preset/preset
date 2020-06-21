import { ContextContract } from '../ContextContract';

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
}

type Condition = boolean | boolean[] | ((context: ContextContract) => Promise<boolean>);
