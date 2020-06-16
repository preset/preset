import { ActionContract } from '.';

/**
 * Delete the target files.
 */
export interface DeleteActionContract extends ActionContract<'delete'> {
  /**
   * A glob matching files in the target directory.
   */
  files: string | string[];
}
