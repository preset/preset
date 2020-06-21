import { ContextContract } from './ContextContract';
import { ApplierOptionsContract } from './ApplierContract';

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
