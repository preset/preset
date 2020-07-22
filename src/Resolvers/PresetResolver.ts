import { ResolverContract, ResolverResultContract, ResolversContract } from '@/Contracts';
import { inject, injectable } from 'inversify';
import { Binding } from '@/Container';
import { Logger } from '@/Logger';

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
      Logger.info(`Trying to resolve ${resolvable} with the ${resolver.name} resolver.`);
      const result = await resolver.resolve(resolvable);

      if (result.success) {
        return {
          ...result,
          temporary: !!result.temporary, // This could be undefined
        };
      }
    }

    throw new Error(`No resolver could find ${resolvable}`);
  }
}
