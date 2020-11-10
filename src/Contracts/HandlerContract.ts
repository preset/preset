import { Action } from '@/Configuration/Action';
import { ApplierOptionsContract } from './ApplierContract';
import { Contextualized } from './PresetContract';

export interface HandlerContract {
  name: string;
  handle(action: Contextualized<Action>, options: ApplierOptionsContract): Promise<void>;
}
