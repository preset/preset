import { Preset, ContextAware } from '@/exports';

/**
 * An action to be executed by the preset.
 *
 * @todo interactions
 */
export abstract class Action<Context = any> {
  public abstract handler: string;
  public abstract name: string;
  public conditions: ContextAware<boolean, Context>[] = [];
  public title?: ContextAware<string | false, Context>;
  public preset: Preset;

  public constructor(preset: Preset) {
    this.preset = preset;
    this.if(true);
  }

  /**
   * Defines the condition required for the action to be run.
   */
  if(conditions: ContextAware<boolean, Context> | ContextAware<boolean, Context>[]): this {
    if (!Array.isArray(conditions)) {
      conditions = [conditions];
    }

    this.conditions.push(...conditions);
    return this;
  }

  /**
   * Runs the action only if the specified option equals the specified value.
   */
  ifOptionEquals(option: string, value?: any): this {
    return this.if(({ options }) => options[option] === value);
  }

  /**
   * Runs the action only if the specified option is truthy.
   *
   * @deprecated Use `ifOption` instead.
   */
  ifHasOption(option: string): this {
    return this.ifOption(option);
  }

  /**
   * Runs the action only if the specified option is truthy.
   */
  ifOption(option: string): this {
    return this.if(({ options }) => Boolean(options[option]));
  }

  /**
   * Runs the action only if the specified option is falsy.
   */
  ifNotOption(option: string): this {
    return this.if(({ options }) => !Boolean(options[option]));
  }

  /**
   * Runs the action only if the specified prompt is truthy.
   */
  ifPrompt(prompt: string): this {
    return this.if(({ prompts }) => Boolean(prompts[prompt]));
  }

  /**
   * Runs the action only if the specified prompt is falsy.
   */
  ifNotPrompt(prompt: string): this {
    return this.if(({ prompts }) => !Boolean(prompts[prompt]));
  }

  /**
   * Runs the action only if the --no-interaction flag is not given.
   */
  ifInteractive(): this {
    return this.if((preset) => preset.isInteractive());
  }

  /**
   * Runs the action only if the target directory is a Git repository.
   */
  ifRepository(): this {
    return this.if((preset) => preset.isRepository());
  }

  /**
   * Runs the action only if the target directory is not a Git repository.
   */
  ifNotRepository(): this {
    return this.if((preset) => !preset.isRepository());
  }

  /**
   * Runs the action only if the target directory is empty.
   */
  ifDirectoryEmpty(): this {
    return this.if((preset) => preset.isTargetDirectoryEmpty());
  }

  /**
   * Runs the action only if the target directory is not empty.
   */
  ifDirectoryNotEmpty(): this {
    return this.if((preset) => !preset.isTargetDirectoryEmpty());
  }

  /**
   * Sets the title of the action.
   */
  withTitle(title?: ContextAware<string | false, Context>): this {
    this.title = title ?? this.title;
    return this;
  }

  /**
   * Hides the title of the action.
   */
  withoutTitle(): this {
    this.title = false;
    return this;
  }
}
