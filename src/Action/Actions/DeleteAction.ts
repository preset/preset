import { ActionContract } from '../Contracts';

/**
 * Delete the target files.
 */
export interface DeleteAction extends ActionContract<'delete'> {
  /**
   * A glob matching files in the target directory.
   */
  files: string | string[];
}
