import { GithubResolver, LocalResolver, ResolverResultContract } from './';
import { Log, Color } from '../';

export class Resolver {
  private static resolvers = {
    local: new LocalResolver(),
    github: new GithubResolver(),
  };
  /**
   * Tries to resolve the preset at the given path.
   */
  static async resolve(path: string): Promise<ResolverResultContract> {
    // Call each resolver
    for (const [name, resolver] of Object.entries(this.resolvers)) {
      Log.debug(`Trying to resolve ${Color.file(path)} with the ${Color.keyword(name)} resolver.`);
      const result = await resolver.resolve(path);

      if (result.success) {
        return {
          ...result,
          // It can be undefined, so we convert it to bool
          temporary: !!result.temporary,
        };
      }
    }

    Log.debug(`No resolver could resolve ${Color.keyword(path)}.`);
    return Log.exit(`Could not find preset ${Color.keyword(path)}.`);
  }
}
