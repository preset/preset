import { BaseActionContract } from './ActionContract';
import { ContextContract } from '../ContextContract';

/**
 * Executes the given piece of code.
 */
export interface CustomActionContract extends BaseActionContract<'custom'> {
  /**
   * A piece of code of your own.
   */
  execute: (context: ContextContract) => Promise<boolean | void> | boolean | void;
}
