import { PresetAware } from '@/Contracts/PresetContract';
import { Action } from './Action';

export class PendingGroup extends Action {
  public handler!: string;
  public name!: string;

  /**
   * Commits the actions in the callback.
   */
  commit(callback?: PresetAware<void>): this {
    this.preset.inheritedAction = this;
    callback?.(this.preset);
    this.preset.inheritedAction = undefined;

    return this;
  }
}
