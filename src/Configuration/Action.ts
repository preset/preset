import { ContextAware, PresetContract } from '@/Contracts/PresetContract';

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
  public preset: PresetContract;

  public constructor(preset: PresetContract) {
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
    return this.if(({ options }) => process.stdout.isTTY && options.interaction !== false);
  }

  /**
   * Sets the title of the action.
   */
  withTitle(title: ContextAware<string>): this {
    this.title = title;
    return this;
  }
}
