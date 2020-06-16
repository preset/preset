import { GithubResolver, LocalResolver } from './Resolvers';
import { Log, Color } from '../';

export class Resolver {
  static async resolve(path: string): Promise<string | never> {
    const resolvers = {
      local: LocalResolver,
      github: GithubResolver,
    };

    // Call each resolver
    for (const [name, resolver] of Object.entries(resolvers)) {
      Log.debug(`Trying to resolve ${Color.file(path)} with the ${Color.keyword(name)} resolver.`);
      const result = await new resolver().resolve(path);

      if (result) {
        return result;
      }
    }

    Log.debug(`No resolver could resolve ${Color.keyword(path)}.`);
    return Log.exit(`Could not find preset ${Color.keyword(path)}.`);
  }
}
