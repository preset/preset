import { ContextAware, PresetContract } from '@/Contracts/PresetContract';
import { ApplyPreset, Copy } from './Actions';
import { Action } from './Action';
import { ConfigValues, SimpleGit } from 'simple-git';
import { CommandLineOptions } from '@/Contracts/ApplierContract';

interface GitContext {
  config: ConfigValues;
  instance: SimpleGit;
}

/**
 * Create a preset.
 */
export class Preset implements PresetContract {
  /**
   * The preset's name.
   */
  public name?: string;

  /**
   * The template directory.
   */
  public templateDirectory: string = 'templates';

  /**
   * The list of actions.
   * You should not update it manually unless you know what you are doing.
   */
  public actions: Action[] = [];

  /**
   * The prompt results.
   */
  public prompts: Map<string, any> = new Map();

  /**
   * The context of the preset.
   */
  public git!: GitContext;

  /**
   * The supplied command line options.
   */
  public options: CommandLineOptions = {};

  /**
   * The supplied command line arguments.
   */
  public args: string[] = [];

  /**
   * Sets the name of the preset.
   */
  setName(name: ContextAware<string>): this {
    this.name = name as string;
    return this;
  }

  /**
   * Sets the template directory.
   */
  setTemplateDirectory(templateDirectory: ContextAware<string>): this {
    this.templateDirectory = templateDirectory as string;
    return this;
  }

  addAction<T extends Action>(action: T): T {
    this.actions.push(action);
    return action;
  }

  /**
   * Applies the given preset.
   */
  apply(resolvable: ContextAware<string>): ApplyPreset {
    return this.addAction(new ApplyPreset(this).apply(resolvable));
  }

  /**
   * Copies files or directory from the preset to the target directory.
   */
  copy(input?: ContextAware<string[]>): Copy {
    return this.addAction(new Copy(this).from(input));
  }
}
