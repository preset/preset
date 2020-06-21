import { BaseActionContract } from './ActionContract';

export interface CopyActionContract extends BaseActionContract<'copy'> {
  /**
   * A glob matching files in the template directory. The directory structure is kept, so you need
   * to organize your template directory as it will be in the target directory.
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
