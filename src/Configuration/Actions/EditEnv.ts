import { Action, ContextAware, Name } from '@/exports';

export type EnvironmentAware<T> = ((env: Record<string, string>) => T) | T;

/**
 * An action for updating a dotenv file.
 */
export class EditEnv<Context = any> extends Action {
  public handler = Name.Handler.EditEnv;
  public name = 'modification of environment files';
  public title = 'Updating environment files...';
  public file: ContextAware<string, Context> = '.env';
  public setters: Map<string, EnvironmentAware<string>> = new Map();
  public shouldCreate: ContextAware<boolean, Context> = true;

  /**
   * Defines the environment file to update.
   */
  update(file: ContextAware<string, Context>): EditEnv<Context> {
    this.file = file;
    return this;
  }

  /**
   * Creates the specified environent file if it's missing.
   */
  createIfMissing(shouldCreate: ContextAware<boolean, Context> = true): EditEnv<Context> {
    this.shouldCreate = shouldCreate;
    return this;
  }

  /**
   * Do not create the file if it's missing.
   */
  skipIfMissing(): EditEnv<Context> {
    this.shouldCreate = false;
    return this;
  }

  /**
   * Sets the given key in the environment file to the given value.
   *
   * @example
   * Preset.setEnv('APP_URL', (env) => env.APP_URL.replace('http:', 'https:')));
   */
  set(key: string, value: EnvironmentAware<string>): EditEnv<Context> {
    this.setters.set(key, value);
    return this;
  }
}
