import { OutputArgs, OutputFlags } from '@oclif/parser';
import { ConfigValues, SimpleGit } from 'simple-git';
import { GeneratorContract } from './GeneratorContract';

export interface ContextContract {
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
   * A complete path to the root target directory.
   */
  targetDirectory: string;

  /**
   * A complete path to the preset file.
   */
  presetFile: string;

  /**
   * The generator object.
   */
  generator: GeneratorContract;

  /**
   * Raw additional command line arguments.
   */
  argv: string[];

  /**
   * Parsed additional arguments from the command line.
   */
  args?: OutputFlags<any>;

  /**
   * Parsed additional flags from the command line.
   */
  flags?: OutputArgs<any>;

  /**
   * True if the current preset directory is temporary.
   */
  temporary: boolean;

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
