type PresetResolvable = string;

export interface ApplierContract {
  /**
   * Applies the given preset. The preset will be resolved.
   *
   * @param preset A value that should resolve to a preset. A name, a git repository or a local path are exemples.
   */
  run(preset: PresetResolvable, options?: Partial<ApplierOptionsContract>): Promise<boolean>;
}

export interface ApplierOptionsContract {
  /**
   * Additional command line arguments.
   */
  argv: string[];

  /**
   * Target directory. Defaults to current working directory.
   */
  in: string;

  /**
   * Whether to debug or not.
   */
  debug: boolean;
}
