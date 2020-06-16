import { Generator } from './Generator';

export interface Context {
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
  generator: Generator;

  /**
   * Additional command line arguments.
   */
  args: string[];
}
