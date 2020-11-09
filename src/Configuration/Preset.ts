import { ContextAware, PresetContract } from '@/Contracts/PresetContract';
import { ApplyPreset, Extract } from './Actions';
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
   * The directory in which the preset is in.
   */
  public presetDirectory!: string;

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
   * Checks if the preset instance is interactive.
   */
  isInteractive(): boolean {
    return process.stdout.isTTY && this.options.interaction !== false;
  }

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

  /**
   * Adds the given action.
   */
  addAction<T extends Action>(action: T): T {
    this.actions.push(action);
    return action;
  }

  /**
   * Applies the given preset.
   *
   * @example
   * // Applies the Laravel "tailwindcss" community preset
   * Preset.apply('laravel:tailwindcss')
   */
  apply(resolvable: ContextAware<string>): ApplyPreset {
    return this.addAction(new ApplyPreset(this).apply(resolvable));
  }

  /**
   * Extracts files or directories from the preset's template directory to the target directory.
   *
   * @example
   * // extracts preset's auth templates to target's root
   * Preset.extract('auth')
   * @example
   * // extracts preset's php files to target's root
   * Preset.extract('*.php')
   * @example
   * // extracts index.php to target's public directory
   * Preset.extract('index.php')
   * @example
   * // extracts gitignore.dotfile to target's root as .gitignore
   * Preset.extract('gitignore.dotfile')
   */
  extract(input: ContextAware<string | string[]> = ''): Extract {
    return this.addAction(new Extract(this).from(input));
  }
}
