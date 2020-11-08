import { inject, injectable } from 'inversify';
import { ApplierContract, ApplierOptionsContract } from '@/Contracts/ApplierContract';
import { ResolverContract } from '@/Contracts/ResolverContract';
import { ImporterContract } from '@/Contracts/ImporterContract';
import { Binding } from '@/Container';
import { Bus } from '@/bus';
import { color } from '@/utils';

@injectable()
export class PresetApplier implements ApplierContract {
  @inject(Binding.Resolver)
  protected resolver!: ResolverContract;

  @inject(Binding.Importer)
  protected importer!: ImporterContract;

  @inject(Binding.Bus)
  protected bus!: Bus;

  async run(options: ApplierOptionsContract): Promise<boolean> {
    this.bus.info(`Applying preset ${color.magenta(options.resolvable)}.`);
    this.bus.debug(`Command line options: ${color.gray(JSON.stringify(options.options))}`);

    const result = await this.resolver.resolve(options.resolvable, {
      path: options.options.path,
    });

    if (!result) {
      return false;
    }

    const preset = await this.importer.import(result.path);

    console.log(preset);

    return false;
  }
}
