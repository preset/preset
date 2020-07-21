import { ContextContract } from './ContextContract';
import { ApplierOptionsContract } from './ApplierContract';
import { ListrTaskWrapper } from 'listr2';
import { ActionContextContract } from './TaskContract';

export interface ParserOptionsContract {
  /**
   * Whether or not the preset directory is temporary and should be
   * deleted after it is applied.
   */
  temporary: boolean;

  /**
   * The package.json contents.
   */
  package?: any;

  /**
   * More options from the applier.
   */
  applierOptions?: Partial<ApplierOptionsContract>;

  /**
   * The current task.
   */
  task?: ListrTaskWrapper<ActionContextContract, any>;
}

export interface ParserContract {
  /**
   * Parses a directory and returns a context.
   *
   * @param directory A local directory containing a preset.
   * @param parserContext Additional context data.
   */
  parse(directory: string, parserContext?: Partial<ParserOptionsContract>): Promise<ContextContract | false>;
}
