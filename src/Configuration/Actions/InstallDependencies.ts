import { ContextAware } from '@/Contracts/PresetContract';
import { Action } from '../Action';
import { Name } from '@/Container';

export type Ecosystem = 'node' | 'php';

export class InstallDependencies extends Action {
  public handler = Name.Handler.InstallDependencies;
  public name = 'dependency installation';
  public title = 'Updating dependencies...';
  public ecosystem: ContextAware<Ecosystem> = 'node';
  public shouldAsk: ContextAware<boolean> = false;

  /**
   * Defines the ecosystem for which to install the dependencies.
   */
  public for(ecosystem: ContextAware<Ecosystem>): this {
    this.ecosystem = ecosystem;
    return this;
  }

  /**
   * Asks the user before installing.
   */
  public ifUserApproves(): this {
    this.shouldAsk = true;
    return this;
  }
}
