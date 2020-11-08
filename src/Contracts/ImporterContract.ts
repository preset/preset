import { Preset } from '@/Configuration/Preset';

export interface ImporterContract {
  import(path: string): Promise<Preset>;
}
