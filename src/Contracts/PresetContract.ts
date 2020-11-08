import { Action } from '@/Configuration/Action';

export interface PresetContract {
  actions: Action[];
  // options: Option[];
}

export interface ContextContract {}

export type ContextAware<T> = T | ((context: ContextContract) => Promise<T>);
