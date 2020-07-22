import { ApplicationContextContract } from './TaskContract';
import { ListrTask } from 'listr2';

type PresetResolvable = string;

export interface ApplierContract {
  /**
   * Applies the given preset. The preset will be resolved.
   *
   * @param preset A value that should resolve to a preset. A name, a git repository or a local path are exemples.
   */
  run(options: ApplierOptionsContract): Promise<ListrTask<ApplicationContextContract>[]>;
}

export interface ApplierOptionsContract {
  /**
   * The preset resolvable string.
   */
  resolvable: PresetResolvable;

  /**
   * Additional command line arguments.
   */
  argv?: string[];

  /**
   * Target directory. Defaults to current working directory.
   */
  in?: string;

  /**
   * Whether to debug or not.
   */
  debug?: boolean;
}
