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

export interface ResolverContract {
  /**
   * Resolves an input to a local preset path.
   *
   * @param resolvable Any input.
   */
  resolve(resolvable: string): Promise<ResolverResultContract>;
}
