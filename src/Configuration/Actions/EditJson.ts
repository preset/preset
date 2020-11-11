import { ContextAware } from '@/Contracts/PresetContract';
import { Action } from '../Action';
import { Name } from '@/Container';

/**
 * An action for editing a JSON file.
 */
export class EditJson extends Action {
  public handler = Name.Handler.EditJson;
  public name = 'JSON file edition';
  public title = 'Updating JSON file...';
  public file?: ContextAware<string>;
  public json?: ContextAware<any>;
  public pathsToDelete: ContextAware<string | string[]> = [];

  /**
   * Sets the path to the file that will be edited.
   */
  setFile(file: ContextAware<string>): this {
    this.file = file;
    return this;
  }

  /**
   * Deeply merges the given content into the JSON file.
   */
  merge(json: ContextAware<any> = {}): this {
    this.json = json;
    return this;
  }

  /**
   * Deletes the given paths from the JSON file.
   */
  delete(paths: ContextAware<string | string[]>): this {
    this.pathsToDelete = paths;
    return this;
  }
}
