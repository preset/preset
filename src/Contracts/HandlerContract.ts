import { Contextualized, ApplierOptionsContract, Action } from '@/exports';

export interface HandlerContract {
  name: string;
  handle(action: Contextualized<Action>, options: ApplierOptionsContract): Promise<void>;
}
