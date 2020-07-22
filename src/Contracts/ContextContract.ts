import { ConfigValues, SimpleGit } from 'simple-git';
import { GeneratorContract } from './GeneratorContract';
import { OutputArgs, OutputFlags } from '@oclif/parser';
import { ListrTaskWrapper } from 'listr2';
import { ActionContextContract, ApplicationContextContract } from './TaskContract';

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
   * Whether or not debug mode is enabled.
   */
  debug: boolean;

  /**
   * The current task.
   */
  task: ListrTaskWrapper<any, any>;

  /**
   * Parsed additional arguments from the command line.
   */
  args?: OutputFlags<any>;

  /**
   * Parsed additional flags from the command line.
   */
  flags?: OutputArgs<any>;

  /**
   * Prompt results. Names are what name are given for each prompt, value are Enquirer's results.
   * @see https://github.com/enquirer/enquirer
   */
  prompts: {
    [name: string]: any;
  };

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
