import {
  HookFunction,
  GeneratorContract,
  ParseObject,
  Actions,
  CopyConflictStrategy,
  ContextAware,
  InstallationMode,
  Ecosystem,
  JsonEntry,
  Searchable,
  SearchableFunction,
  Replacer,
  ReplaceObject,
  RemoveLineObject,
  LineObject,
  PromptOptions,
} from './Contracts';

export class Preset {
  public actions: Partial<Actions>[] = [];

  public name?: string;
  public templates?: string;
  public beforeHook?: HookFunction;
  public beforeEachHook?: HookFunction;
  public afterHook?: HookFunction;
  public afterEachHook?: HookFunction;
  public parseObject?: ContextAware<ParseObject>;

  public static make(generator: GeneratorContract): GeneratorContract;
  public static make(name: string): Preset;
  public static make(x: GeneratorContract | string): any {
    if (typeof x === 'string') {
      return new Preset().setName(x);
    }

    return x;
  }

  public setName(name: string): this {
    this.name = name;

    return this;
  }

  public setTemplateDirectory(directory: string): this {
    this.templates = directory;

    return this;
  }

  public before(hook: HookFunction): this {
    this.beforeHook = hook;

    return this;
  }

  public beforeEach(hook: HookFunction): this {
    this.beforeEachHook = hook;

    return this;
  }

  public after(hook: HookFunction): this {
    this.afterHook = hook;

    return this;
  }

  public afterEach(hook: HookFunction): this {
    this.afterEachHook = hook;

    return this;
  }

  public parse(parseObject: ContextAware<ParseObject>): this {
    this.parseObject = parseObject;

    return this;
  }

  public addAction(action: Partial<Actions>): this {
    Object.keys(action).forEach(key => Reflect.get(action, key) === undefined && Reflect.deleteProperty(action, key));

    this.actions.push(action);

    return this;
  }

  public toGenerator(): GeneratorContract {
    return {
      name: this.name,
      templates: this.templates,
      after: this.afterHook,
      afterEach: this.afterEachHook,
      before: this.beforeHook,
      beforeEach: this.beforeEachHook,
      parse: this.parseObject,
      actions: () => this.actions,
    } as GeneratorContract;
  }

  /*
	|--------------------------------------------------------------------------
	| Actions
	|--------------------------------------------------------------------------
	*/

  /**
   * Copies files to the target directory.
   */
  public copyFiles(files: string | string[]): PendingCopy {
    return new PendingCopy(this).files(files);
  }

  /**
   * Copies directories to the target directory.
   */
  public copyDirectories(
    directories:
      | string
      | string[]
      | {
          [source: string]: string;
        }
  ): PendingCopy {
    return new PendingCopy(this).directories(directories);
  }

  /**
   * Install dependencies.
   *
   * @param mode The installation mode. Either 'install' or 'update'.
   */
  public installDependencies(mode: InstallationMode = 'install'): PendingDependencyInstallation {
    return new PendingDependencyInstallation(this).withMode(mode);
  }

  /**
   * Updates dependencies.
   */
  public updateDependencies(): PendingDependencyInstallation {
    return new PendingDependencyInstallation(this).withMode('update');
  }

  /**
   * Executes custom code.
   */
  public execute(callback?: ContextAware<Function>): PendingCustomCode {
    return new PendingCustomCode(this).code(callback);
  }

  /**
   * Applies an external preset.
   *
   * @param resolvable The preset resolable.
   */
  public apply(resolvable: string): PendingPreset {
    return new PendingPreset(this).resolve(resolvable);
  }

  /**
   * Deletes file or directories.
   */
  public delete(files: string | string[] | false = false): PendingDeletion {
    return new PendingDeletion(this).files(files);
  }

  /**
   * Edits a JSON file.
   */
  public editJson(file?: string): PendingJSONEdition {
    return new PendingJSONEdition(this).file(file);
  }

  /**
   * Edits some files.
   */
  public edit(files?: string | string[]): PendingEdition {
    return new PendingEdition(this).files(files);
  }

  /**
   * Asks for user input.
   */
  public prompts(): PendingPrompts {
    return new PendingPrompts(this);
  }

  /**
   * Ask for confirmation.
   */
  public confirm(message: string, name: string, options: Partial<PromptOptions> = {}): this {
    return this.addAction({
      type: 'prompt',
      prompts: [
        {
          ...options,
          type: 'Toggle',
          message,
          name,
        },
      ],
    });
  }
}

export abstract class PendingObject {
  protected condition?: ContextAware<boolean>;
  protected beforeHook?: HookFunction;
  protected afterHook?: HookFunction;
  protected actionTitle?: string;
  protected customKeys: any = {};

  constructor(protected preset: Preset) {}

  /**
   * Sets a custom key for that object. Don't use unless you know what you are doing.
   */
  setKey(key: string, value: any): this {
    this.customKeys[key] = value;

    return this;
  }

  /**
   * Sets the title for that action.
   */
  title(title: string): this {
    this.actionTitle = title;

    return this;
  }

  /**
   * Pass the condition that determines if that action should run.
   */
  if(condition: ContextAware<boolean>): this {
    this.condition = condition;

    return this;
  }

  /**
   * Runs custom code before the action starts.
   */
  before(callback: HookFunction): this {
    this.beforeHook = callback;

    return this;
  }

  /**
   * Runs custom code after the action finished.
   */
  after(callback: HookFunction): this {
    this.afterHook = callback;

    return this;
  }

  get keys() {
    return {
      ...this.customKeys,
      if: this.condition,
      before: this.beforeHook,
      after: this.afterHook,
      title: this.actionTitle,
    };
  }

  abstract chain(): Preset;
}

class PendingCopy extends PendingObject {
  private target?: string;
  private strategy?: CopyConflictStrategy;
  private shouldIgnoreDotFiles: boolean = false;
  private filesToCopy?: string | string[];
  private directoriesToCopy?: any;

  files(files: string | string[]): this {
    this.filesToCopy = files;
    return this;
  }

  directories(
    directories:
      | string
      | string[]
      | {
          [source: string]: string;
        }
  ): this {
    this.directoriesToCopy = directories;
    return this;
  }

  to(target: string): this {
    this.target = target;
    return this;
  }

  whenConflict(useStrategy: CopyConflictStrategy): this {
    this.strategy = useStrategy;
    return this;
  }

  ignoreDotFiles(ignore: boolean = true): this {
    this.shouldIgnoreDotFiles = ignore;
    return this;
  }

  chain(): Preset {
    return this.preset.addAction({
      type: 'copy',
      ...this.keys,
      target: this.target,
      files: this.filesToCopy,
      directories: this.directoriesToCopy,
      if: this.condition,
      before: this.beforeHook,
      after: this.afterHook,
      title: this.actionTitle,
      strategy: this.strategy,
      ignoreDotfiles: this.shouldIgnoreDotFiles,
    });
  }
}

class PendingDependencyInstallation extends PendingObject {
  private ecosystem?: Ecosystem;
  private mode?: InstallationMode;
  private ask: boolean = true;

  for(ecosystem: Ecosystem): this {
    this.ecosystem = ecosystem;
    return this;
  }

  withMode(mode: InstallationMode): this {
    this.mode = mode;
    return this;
  }

  withoutAsking(): this {
    this.ask = false;
    return this;
  }

  chain(): Preset {
    return this.preset.addAction({
      type: 'install-dependencies',
      ...this.keys,
      for: this.ecosystem,
      mode: this.mode,
      ask: this.ask,
    });
  }
}

class PendingCustomCode extends PendingObject {
  private callback?: ContextAware<Function>;

  code(callback?: ContextAware<Function>): this {
    this.callback = callback;
    return this;
  }

  chain(): Preset {
    return this.preset.addAction({
      type: 'custom',
      ...this.keys,
      execute: this.callback,
    });
  }
}

class PendingPreset extends PendingObject {
  private resolvable?: string;
  private inherits?: boolean;
  private args: string[] = [];

  resolve(resolvable: string): this {
    this.resolvable = resolvable;
    return this;
  }

  inheritsArguments(inherits: boolean = true): this {
    this.inherits = inherits;
    return this;
  }

  with(args: string | string[]): this {
    this.args.concat(args);
    return this;
  }

  chain(): Preset {
    return this.preset.addAction({
      type: 'preset',
      ...this.keys,
      inherit: this.inherits,
      preset: this.resolvable,
      arguments: this.args,
    });
  }
}

class PendingDeletion extends PendingObject {
  private directoriesToDelete: string | false | string[] = false;
  private filesToDelete: string | false | string[] = false;

  files(files: string | string[] | false): this {
    this.filesToDelete = files;
    return this;
  }

  directories(directories: string | string[] | false): this {
    this.directoriesToDelete = directories;
    return this;
  }

  chain(): Preset {
    return this.preset.addAction({
      type: 'delete',
      ...this.keys,
      directories: this.directoriesToDelete,
      files: this.filesToDelete,
    });
  }
}

class PendingJSONEdition extends PendingObject {
  private fileToEdit: string | string[] | undefined;
  private objectToMerge: false | JsonEntry | undefined;
  private pathsToDelete: string[] = [];

  file(fileToEdit?: string | string[]): this {
    this.fileToEdit = fileToEdit;
    return this;
  }

  merge(object: any): this {
    this.objectToMerge = object;
    return this;
  }

  delete(path: string | string[]): this {
    this.pathsToDelete.concat(path);
    return this;
  }

  chain(): Preset {
    return this.preset.addAction({
      type: 'edit-json',
      ...this.keys,
      file: this.fileToEdit,
      merge: this.objectToMerge,
      delete: this.pathsToDelete,
    });
  }
}

class PendingPrompts extends PendingObject {
  private prompts: (PromptOptions<true> & { name: string })[] = [];

  confirm(message: string, name: string, options: Partial<PromptOptions> = {}): this {
    this.prompts.push({
      type: 'Toggle',
      name,
      message,
      ...options,
    } as PromptOptions);

    return this;
  }

  input(message: string, name: string, options: Partial<PromptOptions> = {}): this {
    this.prompts.push({
      type: 'Input',
      name,
      message,
      ...options,
    } as PromptOptions);

    return this;
  }

  add(name: string, prompt: PromptOptions): this {
    this.prompts.push({
      ...prompt,
      name,
    });

    return this;
  }

  chain(): Preset {
    return this.preset.addAction({
      type: 'prompt',
      ...this.keys,
      prompts: this.prompts,
    });
  }
}

class PendingEdition extends PendingObject {
  private replacements: ReplaceObject[] = [];
  private removals: RemoveLineObject[] = [];
  private additions: LineObject[] = [];
  private filesToEdit?: string | string[] | false;

  files(files?: string | string[] | false): this {
    this.filesToEdit = files;
    return this;
  }

  addFile(file: string): this {
    if (false === this.filesToEdit) {
      this.filesToEdit = [file];
      return this;
    }

    if (!Array.isArray(this.filesToEdit)) {
      this.filesToEdit = [this.filesToEdit!];
    }

    this.filesToEdit.push(file);

    return this;
  }

  replace(search: any): PendingLineReplacement {
    return new PendingLineReplacement(this, search);
  }

  makeReplacement(replacement: ReplaceObject): this {
    this.replacements.push(replacement);
    return this;
  }

  search(search: Searchable | SearchableFunction): PendingEditionSearch {
    return new PendingEditionSearch(this, search);
  }

  add(addition: Partial<LineObject>): this {
    const matches = this.additions.filter(({ search }) => search === addition.search);

    if (matches.length) {
      matches.forEach(match => {
        if (addition.after) {
          match.after = addition.after;
        }

        if (addition.before) {
          match.before = addition.before;
        }
      });
    }

    this.additions.push(addition as LineObject);
    return this;
  }

  remove(removal: Partial<RemoveLineObject>): this {
    const matches = this.removals.filter(({ search }) => search === removal.search);

    if (matches.length) {
      matches.forEach(match => {
        if (removal.after) {
          match.after = removal.after;
        }

        if (removal.before) {
          match.before = removal.before;
        }

        if (undefined !== removal.removeMatch) {
          match.removeMatch = removal.removeMatch;
        }

        if (undefined === removal.removeMatch) {
          match.removeMatch = removal.removeMatch ?? false;
        }
      });

      this.removals = matches;
      return this;
    }

    this.removals.push(removal as RemoveLineObject);
    return this;
  }

  chain(): Preset {
    return this.preset.addAction({
      type: 'edit',
      ...this.keys,
      files: this.filesToEdit,
      removeLines: this.removals,
      addLines: this.additions,
      replace: this.replacements,
    });
  }
}

export class PendingEditionSearch {
  constructor(private edition: PendingEdition, protected search: Searchable | SearchableFunction) {}

  addBefore(content: string | string[]): this {
    this.edition.add({
      search: this.search,
      before: content,
    });

    return this;
  }

  addAfter(content: string | string[]): this {
    this.edition.add({
      search: this.search,
      after: content,
    });

    return this;
  }

  removeBefore(count: number): this {
    this.edition.remove({
      search: this.search,
      before: count,
    });

    return this;
  }

  removeAfter(count: number): this {
    this.edition.remove({
      search: this.search,
      after: count,
    });

    return this;
  }

  remove(): this {
    this.edition.remove({
      search: this.search,
      removeMatch: true,
    });

    return this;
  }

  end(): PendingEdition {
    return this.edition;
  }
}

class PendingLineReplacement {
  constructor(private edition: PendingEdition, protected search: Searchable | SearchableFunction) {}

  with(value: Replacer): PendingEdition {
    return this.edition.makeReplacement({
      search: this.search,
      with: value,
    });
  }
}
