import { ContextContract } from './ContextContract';

export interface ParserContextData {
  /**
   * Whether or not the preset directory is temporary and should be
   * deleted after it is applied.
   */
  temporary: boolean;

  /**
   * Additional command line argument to give to the context.
   */
  argv: string[];

  /**
   * The package.json contents.
   */
  package?: any;
}

export interface ParserContract {
  /**
   * Parses a directory and returns a context.
   *
   * @param directory A local directory containing a preset.
   * @param parserContext Additional context data.
   */
  parse(directory: string, parserContext?: Partial<ParserContextData>): Promise<ContextContract | false>;
}
