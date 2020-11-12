import { ContextAware } from '../../Contracts/PresetContract';
import { Action } from '../Action';
import { Name } from '@/Container';
import { Preset } from '../Preset';

export type EditionCallback = (content: string, preset: Preset) => string;

export class LineAddition {
  public direction: 'above' | 'below' = 'above';
  public amountOfLinesToSkip: ContextAware<number> = 0;
  public search?: ContextAware<string | RegExp>;
  public content: ContextAware<string | string[]> = [];
  public indent?: ContextAware<number | string | 'double'>;

  /**
   * Sets the term of the search.
   *
   * @param search The search term. Can be a string or a regular expression.
   */
  find(search?: ContextAware<string | RegExp>): this {
    this.search = search;
    return this;
  }

  /**
   * Sets the direction in which to add the content.
   */
  setDirection(position: 'above' | 'below'): this {
    this.direction = position;
    return this;
  }

  /**
   * Skips the given amount of lines before adding the content.
   */
  skipLines(amountOfLinesToSkip: ContextAware<number>): this {
    this.amountOfLinesToSkip = amountOfLinesToSkip;
    return this;
  }

  /**
   * Defines the content to add.
   */
  setContent(content: ContextAware<string | string[]>): this {
    this.content = content;
    return this;
  }

  /**
   * Defines the indentation of the content that will be added.
   * - null: detect the indentation of the previous
   * - double: detect the indentation of the previous and doubles it
   * - number: use the given amount of spaces
   * - string: use the given string to indent
   */
  withIndent(indent: ContextAware<number | string | 'double'>): this {
    this.indent = indent;
    return this;
  }
}

/**
 * An action for updating a dotenv file.
 */
export class Edit extends Action {
  public handler = Name.Handler.Edit;
  public name = 'modification of a file';
  public title = 'Updating files...';
  public files?: ContextAware<string | string[]>;
  public search?: ContextAware<string | RegExp>;
  public edition: EditionCallback[] = [];
  public additions: LineAddition[] = [];

  /**
   * Defines the files to update. Supports globs, but the globs ignore node_modules, vendors, and lock files.
   */
  setFiles(files?: ContextAware<string | string[]>): this {
    this.files = files;
    return this;
  }

  /**
   * Sets the term of the search.
   *
   * @param search The search term. Can be a string or a regular expression.
   */
  find(search: ContextAware<string | RegExp>): this {
    this.search = search;
    return this;
  }

  /**
   * Updates the file content with the given callback.
   */
  update(callback: EditionCallback): this {
    this.edition.push(callback);
    return this;
  }

  /**
   * Replaces the given variable with the given content.
   *
   * @example
   * Preset.edit('File.stub')
   * 	.replaceVariables(({ options }) => ({
   * 		namespace: options.namespace
   * 	}))
   */
  replaceVariables(replacer: ContextAware<Record<string, string>>): this {
    this.edition.push((content, preset) => {
      if (typeof replacer === 'function') {
        replacer = replacer?.(preset);
      }

      Object.entries(replacer).forEach(([variable, value]) => {
        content = content.split(`{{ ${variable} }}`).join(value);
      });

      return content;
    });

    return this;
  }

  /**
   * Adds the given content after the match.
   */
  addAfter(content: ContextAware<string | string[]>): LineAddition {
    const addition = new LineAddition() //
      .find(this.search)
      .setContent(content)
      .setDirection('below')
      .skipLines(0);

    this.additions.push(addition);
    return addition;
  }

  /**
   * Adds the given content before the match.
   */
  addBefore(content: ContextAware<string | string[]>): LineAddition {
    const addition = new LineAddition() //
      .find(this.search)
      .setContent(content)
      .setDirection('above')
      .skipLines(0);

    this.additions.push(addition);
    return addition;
  }
}
