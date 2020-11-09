type PresetResolvable = string;

export interface ApplierContract {
  /**
   * Applies the given preset. The preset will be resolved.
   *
   * @param preset A value that should resolve to a preset. A name, a git repository or a local path are exemples.
   */
  run(options: ApplierOptionsContract): Promise<void>;
}

export interface ApplierOptionsContract {
  /**
   * The preset resolvable.
   */
  resolvable: PresetResolvable;

  /**
   * Target directory.
   */
  target: string;

  /**
   * List of command line options.
   */
  options: CommandLineOptions;

  /**
   * List of command line arguments.
   */
  args: string[];
}

export interface CommandLineOptions {
  /**
   * The path to a sub-directory in which to look for a preset.
   */
  path?: string;
  [k: string]: any;
}
