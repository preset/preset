import { ContextAware } from '@/Contracts/PresetContract';
import { Preset } from './Preset';

/**
 * An action to be executed by the preset.
 *
 * @todo interactions
 */
export abstract class Action {
  public abstract handler: string;
  public abstract name: string;
  public conditions: ContextAware<boolean>[] = [];
  public title?: ContextAware<string | false>;
  public preset: Preset;

  public constructor(preset: Preset) {
    this.preset = preset;
    this.if(true);
  }

  /**
   * Defines the condition required for the action to be run.
   */
  if(conditions: ContextAware<boolean> | ContextAware<boolean>[]): this {
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
   */
  ifHasOption(option: string): this {
    return this.if(({ options }) => Boolean(options[option]));
  }

  /**
   * Runs the action only if the specified option is falsy.
   */
  ifNotOption(option: string): this {
    return this.if(({ options }) => !Boolean(options[option]));
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
  withTitle(title?: ContextAware<string | false>): this {
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
