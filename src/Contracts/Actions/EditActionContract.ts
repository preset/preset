import { BaseActionContract } from './ActionContract';
import { ContextContract } from '../ContextContract';

/**
 * Edits the matching files.
 */
export interface EditActionContract extends BaseActionContract<'edit'> {
  /**
   * A glob matching files in the template directory. The directory structure is kept, so you need
   * to organize your template directory as it will be in the target directory.
   */
  files: string | string[] | false;

  /**
   * An array of objects describing a search and a replacement value.
   */
  replace?: ReplaceObject[];

  /**
   * An array of objects describing a search and a list of lines to add after or before the matches.
   */
  addLines?: LineObject[];

  /**
   * An array of objects describing a search and a list of lines to remove after or before the matches.
   */
  removeLines?: RemoveLineObject[];
}

export interface SearchableObject {
  /**
   * The element you are looking for. A string, a regular expression, or a method that should return true or false.
   */
  search: Searchable | SearchableFunction;
}

export interface ReplaceObject extends SearchableObject {
  /**
   * The element you want to replace matches with.
   */
  with: Replacer;
}

export interface LineObject extends SearchableObject {
  /**
   * The element you want to add to the line before the match.
   */
  before?: string | string[];
  /**
   * The element you want to add to the line before the match.
   */
  after?: string | string[];
}

export interface RemoveLineObject extends SearchableObject {
  /**
   * True to remove the matched line.
   */
  removeMatch: boolean;
  /**
   * The number of lines to remove after the line that matched.
   */
  before?: number;
  /**
   * The number or lines to remove after the line that matched.
   */
  after?: number;
}

export type Replacer = string | { replacer: (substring: string, ...args: any[]) => string };
export type Searchable = string | RegExp;
export type SearchableFunction = (content: string, context: ContextContract) => Promise<Searchable>;
