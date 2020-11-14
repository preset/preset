import { Action, ContextAware, Name } from '@/exports';

/**
 * An action for applying another preset.
 */
export class ApplyPreset<Context = any> extends Action {
  public handler = Name.Handler.ApplyPreset;
  public name = 'preset application';
  public title = 'Applying a preset...';
  public resolvable?: ContextAware<string, Context>;
  public shouldInheritArguments: ContextAware<boolean, Context> = true;
  public args: ContextAware<string | string[], Context> = [];

  /**
   * Applies the given preset.
   */
  apply(resolvable: ContextAware<string, Context>): ApplyPreset<Context> {
    this.resolvable = resolvable as string;
    return this;
  }

  /**
   * Applies the given arguments to the preset.
   */
  with(args: ContextAware<string | string[], Context>): ApplyPreset<Context> {
    this.args = args;
    return this;
  }

  /**
   * Whether the preset will inherit the current command line arguments.
   */
  inheritsArguments(shouldInheritArguments: ContextAware<boolean, Context> = true): ApplyPreset<Context> {
    this.shouldInheritArguments = shouldInheritArguments;
    return this;
  }
}
