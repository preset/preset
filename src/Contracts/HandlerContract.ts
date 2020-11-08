import { Action } from '@/Configuration/Action';

export interface HandlerContract {
  name: string;
  handle(action: Action): Promise<void>;
}
