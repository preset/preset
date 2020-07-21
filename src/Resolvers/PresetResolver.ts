import { ResolverContract, ResolverResultContract, ResolversContract } from '@/Contracts';
import { inject, injectable } from 'inversify';
import { Binding } from '@/Container';
// import { Log, Color } from '@/Logger';

/**
 * A resolver that loops through other resolvers.
 */
@injectable()
export class PresetResolver implements ResolverContract {
  public readonly name: string = 'preset';

  @inject(Binding.Resolvers)
  private resolvers!: ResolversContract;

  async resolve(resolvable: string): Promise<ResolverResultContract> {
    for (const resolver of this.resolvers) {
      // Log.debug(`Trying to resolve ${Color.resolvable(resolvable)} with the ${Color.keyword(resolver.name)} resolver.`);
      const result = await resolver.resolve(resolvable);

      if (result.success) {
        return {
          ...result,
          temporary: !!result.temporary, // This could be undefined
        };
      }
    }

    // Log.debug(`No resolver could find ${Color.resolvable(resolvable)}.`);
    return {
      success: false,
    };
  }
}
