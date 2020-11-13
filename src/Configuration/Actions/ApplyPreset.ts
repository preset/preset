import { Action, ContextAware, Name } from '@/exports';

/**
 * An action for applying another preset.
 */
export class ApplyPreset extends Action {
  public handler = Name.Handler.ApplyPreset;
  public name = 'preset application';
  public title = 'Applying a preset...';
  public resolvable?: string;
  public shouldInheritArguments: boolean = true;
  public args: string[] = [];

  /**
   * Applies the given preset.
   */
  apply(resolvable: ContextAware<string>): this {
    this.resolvable = resolvable as string;
    return this;
  }

  /**
   * Applies the given arguments to the preset.
   */
  with(args: ContextAware<string> | ContextAware<string>[]): this {
    if (!Array.isArray(args)) {
      args = [args];
    }

    this.args.push(...(args as string[]));
    return this;
  }

  /**
   * Whether the preset will inherit the current command line arguments.
   */
  inheritsArguments(shouldInheritArguments: ContextAware<boolean> = true): this {
    this.shouldInheritArguments = shouldInheritArguments as boolean;
    return this;
  }
}
