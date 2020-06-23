import { GeneratorContract } from './GeneratorContract';

export interface ImporterContract {
  /**
   * Imports a generator from the given preset file.
   * @param filePath A path to the preset file.
   */
  import(filePath: string): Promise<GeneratorContract | false>;
}
