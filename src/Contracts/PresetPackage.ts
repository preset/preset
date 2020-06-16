export interface PresetPackage {
  name: string;
  version: string;
  license: string;
  [key: string]: any;

  /**
   * The path to the preset file. Defaults to index.js.
   */
  preset: string;
}
