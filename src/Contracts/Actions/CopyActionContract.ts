import { BaseActionContract } from './ActionContract';

export interface CopyActionContract extends BaseActionContract<'copy'> {
  /**
   * A glob matching files in the template directory. The directory structure is kept, so you need
   * to organize your template directory as it will be in the target directory.
   */
  files: string | string[];

  /**
   * One or more paths to directories to be recursively copied to the target directory.
   * If an object is given, its keys will be used as the source and its values will be used as the targets.
   */
  directories:
    | string
    | string[]
    | {
        [source: string]: string;
      };

  /**
   * A path relative to the target directory of where the preset will be applied.
   * This is ignored by the directories key.
   */
  target: string;

  /**
   * A strategy defining how a conflict will be handled.
   */
  strategy: CopyConflictStrategy;
}

export const copyConflictStrategies = ['ask', 'override', 'skip'] as const;
export type CopyConflictStrategy = typeof copyConflictStrategies[number];
