export interface ActionContract<T> {
  /**
   * The type of the action.
   */
  type: T;

  /**
   * One or more messages to display before the action is executed.
   */
  before?: string | string[];

  /**
   * One or more messages to display after the action is executed.
   */
  after?: string | string[];
}
