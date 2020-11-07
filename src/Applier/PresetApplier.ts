import { inject, injectable } from 'inversify';
import { ApplierContract, ApplierOptionsContract } from '@/Contracts/ApplierContract';
import { ResolverContract } from '@/Contracts/ResolverContract';
import { Binding } from '@/Container';

@injectable()
export class PresetApplier implements ApplierContract {
  @inject(Binding.Resolver)
  protected resolver!: ResolverContract;

  async run(options: ApplierOptionsContract): Promise<boolean> {
    // Resolves the preset resolvable.
    const result = await this.resolver.resolve(options.resolvable, {
      path: options.options.directory,
    });

    console.log(result);

    if (!result.success) {
      return false;
    }

    return true;
  }
}
