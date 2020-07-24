import { BaseActionContract } from './ActionContract';

/**
 * Runs a command.
 */
export interface RunActionContract extends BaseActionContract<'run'> {
  /**
   * A shell command.
   */
  command: string;
}
