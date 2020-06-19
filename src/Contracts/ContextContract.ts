import { ConfigValues, SimpleGit } from 'simple-git';
import { GeneratorContract } from './GeneratorContract';

export interface ContextContract {
  /**
   * The generator file data.
   */
  generator: Partial<GeneratorContract>;

  /**
   * Name of the preset
   */
  presetName: string;

  /**
   * A complete path to the template directory.
   */
  presetTemplates: string;

  /**
   * A complete path to the preset directory.
   */
  presetDirectory: string;

  /**
   * True if the current preset directory is temporary.
   */
  temporary: boolean;

  /**
   * A complete path to the root target directory.
   */
  targetDirectory: string;

  /**
   * A complete path to the preset file.
   */
  presetFile: string;

  /**
   * Raw additional command line arguments.
   */
  argv: string[];

  /**
   * Git context.
   */
  git: {
    /**
     * Current local options.
     */
    config: ConfigValues;

    /**
     * Git object.
     * @see https://github.com/steveukx/git-js
     */
    context: SimpleGit;
  };
}
