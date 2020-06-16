export interface ResolverContract {
  /**
   * Resolves an input to a local preset path.
   * @param input Any input.
   */
  resolve(input: string): Promise<string | false>;
}
