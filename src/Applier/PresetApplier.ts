import { inject, injectable } from 'inversify';
import { ApplierContract, ApplierOptionsContract } from '@/Contracts/ApplierContract';
import { ResolverContract } from '@/Contracts/ResolverContract';
import { Binding } from '@/Container';
import { logger } from '@poppinss/cliui';

@injectable()
export class PresetApplier implements ApplierContract {
  @inject(Binding.Resolver)
  protected resolver!: ResolverContract;

  async run(options: ApplierOptionsContract): Promise<boolean> {
    // Resolves the preset resolvable.
    const result = await this.resolver.resolve(options.resolvable, {
      path: options.options.path,
    });

    console.log(result);

    return true;
  }
}
