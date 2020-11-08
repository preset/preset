import { ContextAware, PresetContract } from '@/Contracts/PresetContract';

/**
 * An action to be executed by the preset.
 *
 * @todo interactions
 */
export abstract class Action {
  public conditions!: ContextAware<boolean>[];
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

    this.conditions = conditions;
    return this;
  }

  /**
   * Sets the title of the action.
   */
  withTitle(title: ContextAware<string>): this {
    this.title = title;
    return this;
  }
}
