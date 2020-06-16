import { ActionContract } from '../Contracts';

/**
 * Copies the files
 */
export interface CopyAction extends ActionContract<'copy'> {
  /**
   * A glob matching files in the template directory.
   */
  files: string | string[];

  /**
   * A path relative to the target directory of where the preset will be applied.
   */
  target: string;

  /**
   * A strategy defining how a conflict will be handled.
   */
  strategy: CopyConflictStrategy;
}

export const copyConflictStrategies = ['ask', 'override', 'skip'] as const;
export type CopyConflictStrategy = typeof copyConflictStrategies[number];
