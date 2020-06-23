import { BaseActionContract } from './ActionContract';

/**
 * Edits a JSON file.
 */
export interface EditJsonActionContract extends BaseActionContract<'edit-json'> {
  /**
   * A path to the JSON file relative to the target directory.
   */
  file: string | string[];

  /**
   * An object which will be deeply merged to the target JSON file.
   *
   * @example
   * {
   * 	dependencies: {
   * 		tailwindcss: '^1.2'
   * 	}
   * }
   */
  merge?: JsonEntry | false;

  /**
   * A list of JSON paths which should be removed.
   *
   * @example
   * ['dependencies.vue']
   */
  delete?: string | string[] | false;
}

export type JsonValue = string | number;
export type JsonEntry = {
  [key: string]: JsonValue | JsonEntry;
};
