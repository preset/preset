export interface ResolverResultContract {
  /**
   * A value indicating whether or not the resolve process has been successful.
   */
  success: boolean;

  /**
   * The absolute path to the resolved generator.
   */
  path?: string;

  /**
   * A value indicating whether or not the resolved path is temporary. If yes, this path
   * should be deleted after processing.
   */
  temporary?: boolean;
}

/**
 * Available options for all resolvers.
 */
export interface ResolverOptionsContract {
  /**
   * The path to a sub-directory in which to look for a preset.
   */
  path?: string;
}

export interface ResolverContract {
  /**
   * Resolves an input to a local preset path.
   *
   * @param resolvable Any input.
   */
  resolve(resolvable: string, options: ResolverOptionsContract): Promise<ResolverResultContract>;
}

export interface GitResolverResult {
  /**
   * Whether or not to use SSH.
   */
  ssh: boolean;

  /**
   * The organization (or user) name.
   */
  organization: string;

  /**
   * The repository name.
   */
  repository: string;

  /**
   * The Git tag to check out.
   */
  tag?: string;

  /**
   * The path to the subdirectory in the resolved directory.
   */
  path?: string;
}
