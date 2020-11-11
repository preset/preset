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
  public title?: ContextAware<string>;
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
   * Sets the title of the action.
   */
  withTitle(title?: ContextAware<string>): this {
    this.title ??= title;
    return this;
  }
}
