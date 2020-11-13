import { Action, ContextAware, Name } from '@/exports';

export type EnvironmentAware<T> = ((env: Record<string, string>) => T) | T;

/**
 * An action for updating a dotenv file.
 */
export class EditEnv extends Action {
  public handler = Name.Handler.EditEnv;
  public name = 'modification of environment files';
  public title = 'Updating environment files...';
  public file: ContextAware<string> = '.env';
  public setters: Map<string, EnvironmentAware<string>> = new Map();
  public shouldCreate: ContextAware<boolean> = true;

  /**
   * Defines the environment file to update.
   */
  update(file: ContextAware<string>): this {
    this.file = file;
    return this;
  }

  /**
   * Creates the specified environent file if it's missing.
   */
  createIfMissing(shouldCreate: ContextAware<boolean> = true): this {
    this.shouldCreate = shouldCreate;
    return this;
  }

  /**
   * Do not create the file if it's missing.
   */
  skipIfMissing(): this {
    this.shouldCreate = false;
    return this;
  }

  /**
   * Sets the given key in the environment file to the given value.
   *
   * @example
   * Preset.setEnv('APP_URL', (env) => env.APP_URL.replace('http:', 'https:')));
   */
  set(key: string, value: EnvironmentAware<string>): this {
    this.setters.set(key, value);
    return this;
  }
}
