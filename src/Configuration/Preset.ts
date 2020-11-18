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
  HookCallback,
  Hook,
  InstallDependencies,
  Instruct,
  PresetAware,
  PresetContract,
  Prompt,
  PromptOptions,
  Ecosystem,
} from '@/exports';

interface GitContext {
  config: ConfigValues;
  instance: SimpleGit;
}

/**
 * Create a preset.
 */
export class Preset<CustomContext = any> implements PresetContract {
  /**
   * The preset's name.
   */
  public name?: ContextAware<string, any>;

  /**
   * The template directory.
   */
  public templateDirectory: ContextAware<string, any> = 'templates';

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
   * A special object meant to save whatever the preset developer needs.
   */
  public context?: CustomContext;

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
  group<Context = CustomContext>(callback?: PresetAware<void, Context>): Group<Context> {
    return this.addAction(new Group(this).chain(callback));
  }

  /**
   * Adds instructions to be displayed at the end of the installation of the preset.
   */
  instruct<Context = CustomContext>(messages: ContextAware<string | string[]> = []): Instruct<Context> {
    this.instructions = new Instruct().to(messages);
    return this.instructions;
  }

  /**
   * Sets the name of the preset.
   */
  setName<Context = CustomContext>(name: ContextAware<string, Context>): this {
    this.name = name;
    return this;
  }

  /**
   * Sets the template directory.
   */
  setTemplateDirectory<Context = CustomContext>(templateDirectory: ContextAware<string, Context>): this {
    this.templateDirectory = templateDirectory;
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
  apply<Context = CustomContext>(resolvable: ContextAware<string, Context>): ApplyPreset<Context> {
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
  extract<Context = CustomContext>(input: ContextAware<string | string[], Context> = ''): Extract<Context> {
    return this.addAction(new Extract(this).from(input));
  }

  /**
   * Deletes the given paths. They must be relative from the target directory.
   */
  delete<Context = CustomContext>(paths?: ContextAware<string | string[], Context>): Delete<Context> {
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
  execute<Context = CustomContext>(command: ContextAware<string, Context>, ...args: string[]): Execute<Context> {
    return this.addAction(new Execute(this).run(command).withArguments(args));
  }

  /**
   * Executes a custom command. Useful for storing custom context.
   */
  hook<Context = CustomContext>(callback: HookCallback<Context>): Hook<Context> {
    return this.addAction(new Hook(this).run(callback));
  }

  /**
   * Installs the dependencies for the given ecosystem (defaults to Node).
   *
   * @example
   * Preset.installDependencies('php')
   */
  installDependencies<Context = CustomContext>(ecosystem: ContextAware<Ecosystem, Context> = 'node'): InstallDependencies<Context> {
    return this.addAction(new InstallDependencies(this).for(ecosystem));
  }

  /**
   * An alias for `installDependencies`, since they are basically the same.
   *
   * @example
   * Preset.updateDependencies('node')
   */
  updateDependencies<Context = CustomContext>(ecosystem: ContextAware<Ecosystem, Context> = 'node'): InstallDependencies<Context> {
    return this.installDependencies(ecosystem);
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
  editJson<Context = CustomContext>(file: ContextAware<string | 'package.json' | 'composer.json', Context>): EditJson<Context> {
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
  env<Context = CustomContext>(file: ContextAware<string, Context> = '.env'): EditEnv<Context> {
    return this.addAction(new EditEnv(this).update(file));
  }

  /**
   * Updates the environment file with the given values.
   */
  setEnv<Context = CustomContext>(
    key: string,
    value: EnvironmentAware<string>,
    file: ContextAware<string, Context> = '.env',
  ): EditEnv<Context> {
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
  input<Context = CustomContext>(
    name: string,
    message: ContextAware<string, Context>,
    initial?: ContextAware<string, Context>,
    options: Partial<PromptOptions> = {},
  ): Prompt<Context> {
    return this.addAction(new Prompt(this).input(name, message, initial, options));
  }

  /**
   * Asks the user for information.
   */
  prompt<Context = CustomContext>(): Prompt<Context> {
    return this.addAction(new Prompt(this));
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
  confirm<Context = CustomContext>(
    name: string,
    message: ContextAware<string, Context>,
    initial: ContextAware<boolean, Context> = false,
    options: Partial<PromptOptions> = {},
  ): Prompt<Context> {
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
  toggle<Context = CustomContext>(
    name: string,
    message: ContextAware<string, Context>,
    choices: [string, string],
    initial: ContextAware<boolean, Context> = false,
    options: Partial<PromptOptions> = {},
  ): Prompt<Context> {
    return this.addAction(new Prompt(this).toggle(name, message, choices, initial, options));
  }

  /**
   * Edits the given files.
   */
  edit<Context = CustomContext>(files: ContextAware<string | string[], Context>): Edit<Context> {
    return this.addAction(new Edit(this).setFiles(files));
  }
}
