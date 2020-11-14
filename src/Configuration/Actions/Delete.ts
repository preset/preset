import { Action, ContextAware, Name } from '@/exports';

/**
 * An action for deleting a file or directory in the target directory.
 */
export class Delete<Context = any> extends Action {
  public handler = Name.Handler.Delete;
  public name = 'deletion';
  public title = 'Deleting files...';
  public paths: ContextAware<string | string[], Context> = [];

  /**
   * Adds one or more paths to the list of paths to delete.
   */
  setPaths(paths?: ContextAware<string | string[], Context>): Delete<Context> {
    this.paths = paths ?? [];
    return this;
  }
}
