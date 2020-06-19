type PresetResolvable = string;

export interface ApplierContract {
  /**
   * Applies the given preset. The preset will be resolved.
   *
   * @param preset A value that should resolve to a preset. A name, a git repository or a local path are exemples.
   * @param argv Additional command line arguments.
   * @param debug Whether to debug or not.
   */
  run(preset: PresetResolvable, argv: string[], debug: boolean): Promise<boolean>;
}
