import { Preset } from '@/exports';

export interface ImporterContract {
  import(path: string): Promise<Preset>;
}
