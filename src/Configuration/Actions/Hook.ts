import { Action, PresetAware, ContextAware, Name } from '@/exports';

export type HookCallback<T = any> = PresetAware<Promise<void> | void, T>;
interface HookCallbackWrapper {
  callback: HookCallback;
}

export class Hook<Context = any> extends Action {
  public handler = Name.Handler.Execute;
  public name = 'custom code block';
  public title = 'Executing additionnal logic...';
  public hooks: ContextAware<HookCallbackWrapper, Context>[] = [];

  /**
   * Executes the given callback.
   */
  public run(callback: HookCallback<Context>): Hook<Context> {
    this.hooks.push({ callback });
    return this;
  }
}
