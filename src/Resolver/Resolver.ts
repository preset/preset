import { inject, injectable } from 'inversify';
import { Binding, Bus, color, container, Name, ResolutionError, ResolverContract, ResolverOptions, ResolverResult } from '@/exports';

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

      try {
        return await resolver.resolve(resolvable, options);
      } catch (error) {
        if (error.fatal) {
          throw error;
        }

        this.bus.debug(color.gray(`The ${resolver.name!} resolver could not resolve ${resolvable}.`));
      }
    }

    throw ResolutionError.resolutionFailed(resolvable);
  }
}
