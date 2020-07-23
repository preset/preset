import {
  BaseActionContract,
  HookFunction,
  GeneratorContract,
  ContextContract,
  ParseObject,
  Actions,
  CopyConflictStrategy,
  ContextAware,
  InstallationMode,
  Ecosystem,
} from './Contracts';

export class Preset {
  public actions: Partial<Actions>[] = [];

  public name?: string;
  public templates?: string;
  public beforeHook?: HookFunction;
  public beforeEachHook?: HookFunction;
  public afterHook?: HookFunction;
  public afterEachHook?: HookFunction;
  public parseObject?: ParseObject;

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

  public copyFiles(files: string | string[]): PendingCopy {
    return new PendingCopy(this).files(files);
  }

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

  public installDependencies(mode: InstallationMode = 'install'): PendingDependencyInstallation {
    return new PendingDependencyInstallation(this).withMode(mode);
  }

  public updateDependencies(): PendingDependencyInstallation {
    return new PendingDependencyInstallation(this).withMode('update');
  }
}

export abstract class PendingObject {
  protected condition?: ContextAware<boolean>;
  protected beforeHook?: HookFunction;
  protected afterHook?: HookFunction;
  protected actionTitle?: string;
  protected keys: any = {};

  constructor(protected preset: Preset) {}

  setKey(key: string, value: any): this {
    this.keys[key] = value;

    return this;
  }

  title(title: string): this {
    this.actionTitle = title;

    return this;
  }

  if(condition: ContextAware<boolean>): this {
    this.condition = condition;

    return this;
  }

  before(callback: HookFunction): this {
    this.beforeHook = callback;

    return this;
  }

  after(callback: HookFunction): this {
    this.afterHook = callback;

    return this;
  }

  abstract then(): Preset;
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

  then(): Preset {
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

  for(ecosystem: Ecosystem): this {
    this.ecosystem = ecosystem;
    return this;
  }

  withMode(mode: InstallationMode): this {
    this.mode = mode;
    return this;
  }

  then(): Preset {
    return this.preset.addAction({
      type: 'install-dependencies',
      ...this.keys,
      for: this.ecosystem,
      mode: this.mode,
      if: this.condition,
      before: this.beforeHook,
      after: this.afterHook,
      title: this.actionTitle,
    });
  }
}
