import { ContextAware } from '@/Contracts/PresetContract';
import { Action } from '../Action';
import { Name } from '@/Container';
import { straightThroughStringTask } from 'simple-git/src/lib/tasks/task';

/**
 * An action for deleting a file or directory in the target directory.
 */
export class Delete extends Action {
  public handler = Name.Handler.Delete;
  public name = 'deletion';
  public title = 'Deleting files...';
  public paths: ContextAware<string | string[]> = [];

  /**
   * Adds one or more paths to the list of paths to delete.
   */
  setPaths(paths?: ContextAware<string | string[]>): this {
    this.paths = paths ?? [];
    return this;
  }
}
