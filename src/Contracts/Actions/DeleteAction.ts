import { BaseAction } from './BaseAction';

/**
 * Delete the target files.
 */
export interface DeleteAction extends BaseAction<'delete'> {
  /**
   * A glob matching files in the target directory.
   */
  files: string | string[];
}
