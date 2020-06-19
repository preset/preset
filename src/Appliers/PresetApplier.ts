import { injectable, inject } from 'inversify';
import { ApplierContract, ResolverContract, ParserContract } from '@/Contracts';
import { Binding } from '@/Container';

/**
 * Tries to resolve the given resolvable to a preset.
 * If found, applies it to the current context.
 */
@injectable()
export class PresetApplier implements ApplierContract {
  @inject(Binding.Resolver)
  private resolver!: ResolverContract;

  @inject(Binding.Parser)
  private parser!: ParserContract;

  async run(resolvable: string, argv: string[], debug: boolean): Promise<boolean> {
    // Tries to resolve the given path/name/whatever
    const result = await this.resolver.resolve(resolvable);

    // Instantly leave if the resolvable couldn't be resolved
    if (!result || !result.success || !result.path) {
      return false;
    }

    // Parses the preset
    const context = await this.parser.parse(result.path, {
      argv,
      temporary: !!result?.temporary,
    });

    console.log({
      resolvable,
      context,
      argv,
      debug,
      result,
    });

    return true;
  }
}
