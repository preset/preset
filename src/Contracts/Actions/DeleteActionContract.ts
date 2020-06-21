import { BaseActionContract } from './ActionContract';

/**
 * Delete the specified files on the target directory.
 */
export interface DeleteActionContract extends BaseActionContract<'delete'> {
  /**
   * A glob matching files in the target directory.
   */
  files: string | string[];
}
