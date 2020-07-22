import { GeneratorContract } from './GeneratorContract';
import { Preset } from '@/Preset';

export interface ImporterContract {
  /**
   * Imports a generator from the given preset file.
   * @param filePath A path to the preset file.
   */
  import(filePath: string): Promise<GeneratorContract | Preset | false>;
}
