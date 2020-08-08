import { BaseActionContract } from './ActionContract';
import { CommonSpawnOptions, ChildProcess } from 'child_process';

/**
 * Runs a command.
 */
export interface RunActionContract extends BaseActionContract<'run'> {
  /**
   * A shell command.
   */
  command: string;

  /**
   * The spawn options.
   */
  options?: CommonSpawnOptions;

  /**
   * A method to hook into the process.
   */
  hook?: (process: ChildProcess) => Promise<void>;
}
