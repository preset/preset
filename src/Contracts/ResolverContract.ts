/**
 * Information about a preset hosted on the local disk.
 */
export interface LocalPreset {
  type: 'local';

  /**
   * The absolute path to the preset on the local disk.
   */
  path: string;
}

/**
 * Information about a preset hosted on Git.
 */
export interface RepositoryPreset {
  type: 'repository';

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
   * The Git tag or branch to check out.
   */
  tag?: string;
}

/**
 * Information about a preset that was resolved from the user input.
 */
export type LocatedPreset = LocalPreset | RepositoryPreset;

/**
 * Information about the location of a preset after being persisted.
 */
export interface PresetLocation {
  path: string;
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
  ssh?: boolean;
}

export interface ResolverContract {
  /**
   * The resolver name.
   */
  name?: string;

  /**
   * Resolves an input to a local preset path.
   *
   * @param resolvable Any input.
   */
  resolve(resolvable: string, options: ResolverOptions): Promise<PresetLocation>;
}

export interface LocatorContract {
  /**
   * The locator name.
   */
  name?: string;

  /**
   * Determines where a preset is hosted thanks to its resolvable string.
   *
   * @param resolvable Any input.
   */
  locate(resolvable: string): Promise<LocatedPreset>;
}
