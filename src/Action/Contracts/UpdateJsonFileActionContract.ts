import { ActionContract } from '.';

export interface JSON {
  [key: string]: string | string[] | JSON;
}

/**
 * Update a JSON file.
 */
export interface UpdateJsonFileActionContract extends ActionContract<'update-json-file'> {
  /**
   * A path relative to the target directory, pointing to the JSON file.
   */
  target: string;

  /**
   * Deeply merge the given JSON object.
   */
  merge?: JSON;

  /**
   * Deeply remove the given JSON object.
   */
  remove?: string | number | symbol;

  /**
   * Replace with the given JSON object.
   */
  replace?: string | string[];

  /**
   * A strategy describing what to do if the target file does not exist.
   */
  strategy: NotFoundStrategy;
}

export const notFoundStrategies = ['create', 'skip'] as const;
export type NotFoundStrategy = typeof notFoundStrategies[number];
