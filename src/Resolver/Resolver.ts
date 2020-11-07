import { Binding, container, Name } from '@/Container';
import { ResolverContract, ResolverOptionsContract, ResolverResultContract } from '@/Contracts/ResolverContract';
import { bus, resolveStarted } from '@/events';
import { injectable } from 'inversify';

@injectable()
export class Resolver implements ResolverContract {
  async resolve(resolvable: string, options: ResolverOptionsContract): Promise<ResolverResultContract> {
    bus.publish(resolveStarted({ resolvable }));

    const resolvers = [
      // container.getNamed<ResolverContract>(Binding.Resolver, Name.LocalResolver),
      container.getNamed<ResolverContract>(Binding.Resolver, Name.GitHubResolver),
    ];

    for (const resolver of resolvers) {
      const result = await resolver.resolve(resolvable, options);

      if (result) {
        return result;
      }
    }

    return {
      success: false,
    };
  }
}
