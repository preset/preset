import fs from 'fs-extra';
import path from 'path';
import { ConfigValues, SimpleGit } from 'simple-git';
import {
  Action,
  ApplyPreset,
  CommandLineOptions,
  ContextAware,
  Delete,
  Edit,
  EditEnv,
  EditJson,
  EditNodePackages,
  EditPhpPackages,
  EnvironmentAware,
  Execute,
  Extract,
  Group,
  InstallDependencies,
  Instruct,
  PresetAware,
  PresetContract,
  Prompt,
  PromptOptions,
} from '@/exports';

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
   * The directory in which the preset is.
   */
  public presetDirectory!: string;

  /**
   * The directory in which the preset is applied.
   */
  public targetDirectory!: string;

  /**
   * The list of actions.
   * You should not update it manually unless you know what you are doing.
   */
  public actions: Action[] = [];

  /**
   * A set of instructions to display after the preset is installed.
   */
  public instructions?: Instruct;

  /**
   * The prompt results.
   */
  public prompts: Record<string, any> = {};

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
   * Checks if the target directory is a Git repository.
   */
  isRepository(): boolean {
    return fs.existsSync(path.join(this.targetDirectory, '.git'));
  }

  /**
   * Checks if the target directory is empty.
   */
  isTargetDirectoryEmpty(): boolean {
    return fs.readdirSync(path.join(this.targetDirectory, '.git')).length === 0;
  }

  /**
   * Registers a default value for an option.
   */
  option<T>(key: string, value?: T): this {
    this.options[key] = value;
    return this;
  }

  /**
   * Groups a set of instructions together.
   *
   * @example
   * Preset.group((preset) => {
   * 	preset.edit('AppServiceProvider.php')
   * 		.find(/use Illuminate\\Support\\ServiceProvider;/)
   * 		.addAfter('use Illuminate\\Pagination\\Paginator;');
   *
   * 	preset.edit('AppServiceProvider.php') //
   * 		.find('public function boot')
   * 		.addAfter('Paginator::useTailwind();')
   * 		.withIndent('double')
   * 		.skipLines(1);
   * }).withTitle('Updating AppServiceProvider...');
   */
  group(callback?: PresetAware<void>): Group {
    return this.addAction(new Group(this).chain(callback));
  }

  /**
   * Adds instructions to be displayed at the end of the installation of the preset.
   */
  instruct(messages: string | string[] = []): Instruct {
    this.instructions = new Instruct().to(messages);
    return this.instructions;
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

  /**
   * Deletes the given paths. They must be relative from the target directory.
   */
  delete(paths?: ContextAware<string | string[]>): Delete {
    return this.addAction(new Delete(this).setPaths(paths));
  }

  /**
   * Executes a shell command.
   *
   * @param command The program or command to execute.
   * @param args A list of arguments to pass to the program.
   *
   * @example
   * Preset.execute('echo', 'hello world')
   */
  execute(commands: ContextAware<string | string[]>, ...args: string[]): Execute {
    return this.addAction(new Execute(this).setCommands(commands).withArguments(args));
  }

  /**
   * Installs the dependencies for the given ecosystem (defaults to Node).
   *
   * @example
   * Preset.installDependencies().for('php')
   */
  installDependencies(): InstallDependencies {
    return this.addAction(new InstallDependencies(this).for('node'));
  }

  /**
   * An alias for `installDependencies`, since they are basically the same.
   *
   * @example
   * Preset.updateDependencies().for('php')
   */
  updateDependencies(): InstallDependencies {
    return this.installDependencies();
  }

  /**
   * Edits the given JSON file.
   *
   * @example
   * Preset.editJson('package.json')
   * 	.merge({
   * 		devDependencies: {
   * 			tailwindcss: '^2.0'
   * 		}
   * 	})
   * 	.delete(['devDependencies.bootstrap'])
   */
  editJson(file: ContextAware<string | 'package.json' | 'composer.json'>): EditJson {
    return this.addAction(new EditJson(this)).setFile(file);
  }

  /**
   * Edits the package.json file.
   */
  editNodePackages(): EditNodePackages {
    return this.addAction(new EditNodePackages(this)).setFile('package.json');
  }

  /**
   * Edits the composer.json file.
   */
  editPhpPackages(): EditPhpPackages {
    return this.addAction(new EditPhpPackages(this)).setFile('composer.json');
  }

  /**
   * Updates the environment file.
   */
  env(file: string = '.env'): EditEnv {
    return this.addAction(new EditEnv(this).update(file));
  }

  /**
   * Updates the environment file with the given values.
   */
  setEnv(key: string, value: EnvironmentAware<string>, file: string = '.env'): EditEnv {
    return this.env(file).set(key, value);
  }

  /**
   * Asks the user for something.
   *
   * @param name The value name that will be set in the prompts property.
   * @param message The question to ask.
   * @param initial The default value.
   * @param options The prompt options. https://github.com/enquirer/enquirer#prompt-options
   *
   * @see https://github.com/enquirer/enquirer#prompt-options
   */
  input(name: string, message: ContextAware<string>, initial?: ContextAware<string>, options: Partial<PromptOptions> = {}): Prompt {
    return this.addAction(new Prompt(this).input(name, message, initial, options));
  }

  /**
   * Asks the user for confirmation.
   *
   * @param name The value name that will be set in the prompts property.
   * @param message The question to ask.
   * @param initial The default value.
   * @param options The prompt options. https://github.com/enquirer/enquirer#prompt-options
   *
   * @see https://github.com/enquirer/enquirer#prompt-options
   */
  confirm(
    name: string,
    message: ContextAware<string>,
    initial: ContextAware<boolean> = false,
    options: Partial<PromptOptions> = {},
  ): Prompt {
    return this.addAction(new Prompt(this).confirm(name, message, initial, options));
  }

  /**
   * Asks the user for confirmation.
   *
   * @param name The value name that will be set in the prompts property.
   * @param message The question to ask.
   * @param choices A tuple which first value is the truthy one and the second the falsy.
   * @param initial The default value.
   * @param options The prompt options. https://github.com/enquirer/enquirer#prompt-options
   *
   * @see https://github.com/enquirer/enquirer#prompt-options
   */
  toggle(
    name: string,
    message: ContextAware<string>,
    choices: [string, string],
    initial: ContextAware<boolean> = false,
    options: Partial<PromptOptions> = {},
  ): Prompt {
    return this.addAction(new Prompt(this).toggle(name, message, choices, initial, options));
  }

  /**
   * Edits the given files.
   */
  edit(files: ContextAware<string | string[]>): Edit {
    return this.addAction(new Edit(this).setFiles(files));
  }
}
