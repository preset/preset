import { Binding, container, Name } from '@/Container';
import { ResolverContract, ResolverOptionsContract, ResolverResultContract } from '@/Contracts/ResolverContract';
import { ResolutionError } from '@/Errors';
import { bus, resolveStarted } from '@/events';
import { logger } from '@poppinss/cliui';
import { injectable } from 'inversify';

@injectable()
export class Resolver implements ResolverContract {
  async resolve(resolvable: string, options: ResolverOptionsContract): Promise<ResolverResultContract> {
    bus.publish(resolveStarted({ resolvable }));

    const resolvers = [
      container.getNamed<ResolverContract>(Binding.Resolver, Name.LocalResolver),
      container.getNamed<ResolverContract>(Binding.Resolver, Name.GitHubResolver),
    ];

    for (const resolver of resolvers) {
      try {
        return await resolver.resolve(resolvable, options);
      } catch (error) {
        logger.debug(error.message);
        // todo event
      }
    }

    throw ResolutionError.couldNotResolve(resolvable);
  }
}
