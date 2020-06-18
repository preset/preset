type Condition = boolean | (() => boolean);
export interface ActionContract<T> {
  /**
   * The type of the action.
   */
  type: T | 'none';

  /**
   * One or more messages to display before the action is executed.
   */
  before?: string | string[];

  /**
   * One or more messages to display after the action is executed.
   */
  after?: string | string[];

  /**
   * Executes the action only if the condition is met.
   */
  if?: Condition | Condition[];
}
