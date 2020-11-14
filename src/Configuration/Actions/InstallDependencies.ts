import { Action, ContextAware, Name } from '@/exports';

export type Ecosystem = 'node' | 'php';

export class InstallDependencies<Context = any> extends Action {
  public handler = Name.Handler.InstallDependencies;
  public name = 'dependency installation';
  public title = 'Updating dependencies...';
  public ecosystem: ContextAware<Ecosystem, Context> = 'node';
  public shouldAsk: ContextAware<boolean, Context> = false;

  /**
   * Defines the ecosystem for which to install the dependencies.
   */
  public for(ecosystem: ContextAware<Ecosystem, Context>): InstallDependencies<Context> {
    this.ecosystem = ecosystem;
    return this;
  }

  /**
   * Asks the user before installing.
   */
  public ifUserApproves(): InstallDependencies<Context> {
    this.shouldAsk = true;
    return this;
  }
}
