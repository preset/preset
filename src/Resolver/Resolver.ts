import { Bus } from '@/bus';
import { ResolutionError } from '@/Errors';
import { Binding, container, Name } from '@/Container';
import { ResolverContract, ResolverOptions, ResolverResult } from '@/Contracts/ResolverContract';
import { inject, injectable } from 'inversify';
import { color } from '@/utils';

@injectable()
export class Resolver implements ResolverContract {
  @inject(Binding.Bus)
  protected bus!: Bus;

  async resolve(resolvable: string, options: ResolverOptions): Promise<ResolverResult> {
    this.bus.debug(`Resolving ${color.magenta(resolvable)}.`);

    const resolvers = [
      container.getNamed<ResolverContract>(Binding.Resolver, Name.LocalResolver),
      container.getNamed<ResolverContract>(Binding.Resolver, Name.CommunityResolver),
      container.getNamed<ResolverContract>(Binding.Resolver, Name.GitHubResolver),
    ];

    for (const resolver of resolvers) {
      this.bus.debug(`Trying the ${resolver.name!} resolver...`);
      const result = await resolver.resolve(resolvable, options);

      if (result) {
        this.bus.debug(color.gray(`Successfully resolved ${resolvable}.`));
        return result;
      }

      this.bus.debug(color.gray(`The ${resolver.name!} resolver could not resolve ${resolvable}.`));
    }

    throw ResolutionError.resolutionFailed(resolvable);
  }
}
