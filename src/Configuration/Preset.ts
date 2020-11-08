import { ContextAware, PresetContract } from '@/Contracts/PresetContract';
import { ApplyPreset } from './Actions';
import { Action } from './Action';

/**
 * Create a preset.
 */
export class Preset implements PresetContract {
  public name?: string;
  public templateDirectory: string = 'templates';
  public actions: Action[] = [];
  // public options: Option[];

  /**
   * Sets the name of the preset.
   */
  setName(name: string): this {
    this.name = name;
    return this;
  }

  /**
   * Sets the template directory.
   */
  setTemplateDirectory(templateDirectory: string): this {
    this.templateDirectory = templateDirectory;
    return this;
  }

  /**
   * Applies the given preset.
   */
  apply(resolvable: ContextAware<string>): ApplyPreset {
    const action = new ApplyPreset(this).apply(resolvable);
    this.actions.push(action);
    return action;
  }
}
