export type ResolverResult = false | ResolverSuccessResult;
export interface ResolverSuccessResult {
  /**
   * The absolute path to the resolved generator.
   */
  path: string;
 
  /**
   * A value indicating whether or not the resolved path is temporary. If yes, this path
   * should be deleted after processing.
   */
  temporary: boolean;
}

/**
 * Available options for all resolvers.
 */
export interface ResolverOptions {
  /**
   * The path to a sub-directory in which to look for a preset.
   */
  path?: string;

  /**
   * If defined, force whether or not repositories should be accessed via SSH.
   */
  shh?: boolean;
}

export interface ResolverContract {
  /**
   * Resolves an input to a local preset path.
   *
   * @param resolvable Any input.
   */
  resolve(resolvable: string, options: ResolverOptions): Promise<ResolverResult>;
}

export interface GitResolverResult {
  /**
   * Whether or not to use SSH.
   */
  ssh?: boolean;

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
