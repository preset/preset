import { Action } from '../Action';
import { ContextAware } from '@/Contracts/PresetContract';

/**
 * An action for applying another preset.
 */
export class ApplyPreset extends Action {
  public resolvable?: ContextAware<string>;
  public shouldInheritArguments: ContextAware<boolean> = true;
  public args: ContextAware<string>[] = [];

  /**
   * Applies the given preset.
   */
  apply(resolvable: ContextAware<string>): this {
    this.resolvable = resolvable;
    return this;
  }

  /**
   * Applies the given arguments to the preset.
   */
  with(args: ContextAware<string> | ContextAware<string>[]): this {
    if (!Array.isArray(args)) {
      args = [args];
    }

    this.args.push(...args);
    return this;
  }

  /**
   * Whether the preset will inherit the current command line arguments.
   */
  inheritsArguments(shouldInheritArguments: ContextAware<boolean>): this {
    this.shouldInheritArguments = shouldInheritArguments;
    return this;
  }
}
