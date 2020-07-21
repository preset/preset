import { ResolverResultContract, ContextContract, BaseActionContract, ActionHandlerContract } from '.';

export interface ApplicationContextContract {
  resolverResult: ResolverResultContract;
  context: ContextContract;
}

export interface ActionContextContract {
  action: BaseActionContract<any>;
  skip: boolean;
  handler: ActionHandlerContract<any>;
  context: ContextContract;
}
