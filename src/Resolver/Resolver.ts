import { Binding, container, Name } from '@/Container';
import { ResolverContract, ResolverOptions, ResolverResult } from '@/Contracts/ResolverContract';
import { ResolutionError } from '@/Errors';
import { bus, resolveStarted } from '@/events';
import { logger } from '@poppinss/cliui';
import { injectable } from 'inversify';

@injectable()
export class Resolver implements ResolverContract {
  async resolve(resolvable: string, options: ResolverOptions): Promise<ResolverResult> {
    bus.publish(resolveStarted({ resolvable }));

    const resolvers = [
      container.getNamed<ResolverContract>(Binding.Resolver, Name.LocalResolver),
      container.getNamed<ResolverContract>(Binding.Resolver, Name.CommunityResolver),
      container.getNamed<ResolverContract>(Binding.Resolver, Name.GitHubResolver),
    ];

    for (const resolver of resolvers) {
      const result = await resolver.resolve(resolvable, options);

      if (result) {
        return result;
      }
    }

    throw ResolutionError.resolutionFailed(resolvable);
  }
}
