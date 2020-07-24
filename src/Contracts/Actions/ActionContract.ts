import { HookFunction, ContextAware } from '../GeneratorContract';

/**
 * An action.
 */
export interface BaseActionContract<T = any> {
  /**
   * The type of action to create. This is required.
   */
  type: T;

  /**
   * A human-friendly title for that action.
   */
  title?: string;

  /**
   * Executes the action only if the given conditions are met.
   */
  if?: ContextAware<boolean | boolean[]>;

  /**
   * A function to be executed before the action starts.
   */
  before?: HookFunction;

  /**
   * A function to be executed after the action starts.
   */
  after?: HookFunction;
}
