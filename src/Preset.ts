import {
  BaseActionContract,
  HookFunction,
  GeneratorContract,
  ContextContract,
  ParseObject,
  Actions,
  CopyConflictStrategy,
  ContextAware,
  CopyActionContract,
} from './Contracts';

type PromisedAction<T> =
  | Partial<BaseActionContract<T>>
  | ((context: ContextContract) => Promise<Partial<BaseActionContract<T>>>);
[];

export class Preset {
  public actions: Partial<PromisedAction<any>>[] = [];

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
	| Copy
	|--------------------------------------------------------------------------
	*/

  public copyFiles(files: string): PendingCopy {
    return new PendingCopy(this).files(files);
  }
}

export abstract class PendingObject {
  protected condition?: ContextAware<boolean>;
  protected beforeHook?: HookFunction;
  protected afterHook?: HookFunction;
  protected actionTitle?: string;

  constructor(protected preset: Preset) {}

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
  private target?: ContextAware<string>;
  private strategy?: CopyConflictStrategy;
  private shouldIgnoreDotFiles: boolean = false;
  private filesToCopy?: ContextAware<string | string[]>;
  private directoriesToCopy?: any;

  files(files: ContextAware<string | string[]>): this {
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
    const action: CopyActionContract = {
      type: 'copy',
      target: this.target! as any,
      files: this.filesToCopy! as any,
      directories: this.directoriesToCopy,
      if: this.condition,
      before: this.beforeHook,
      after: this.afterHook,
      title: this.actionTitle,
      strategy: this.strategy!,
      ignoreDotfiles: this.shouldIgnoreDotFiles,
    };

    Object.keys(action).forEach(key => Reflect.get(action, key) === undefined && Reflect.deleteProperty(action, key));

    return this.preset.addAction(action);
  }
}
