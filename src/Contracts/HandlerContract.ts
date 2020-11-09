import { Action } from '@/Configuration/Action';
import { ApplierOptionsContract } from './ApplierContract';

export interface HandlerContract {
  name: string;
  handle(action: Action, options: ApplierOptionsContract): Promise<void>;
}
