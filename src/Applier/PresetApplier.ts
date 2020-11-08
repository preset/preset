import { inject, injectable } from 'inversify';
import { ApplierContract, ApplierOptionsContract } from '@/Contracts/ApplierContract';
import { ResolverContract } from '@/Contracts/ResolverContract';
import { Binding } from '@/Container';
import { Bus } from '@/bus';
import { color } from '@/utils';

@injectable()
export class PresetApplier implements ApplierContract {
  @inject(Binding.Resolver)
  protected resolver!: ResolverContract;

  @inject(Binding.Bus)
  protected bus!: Bus;

  async run(options: ApplierOptionsContract): Promise<boolean> {
    this.bus.info(`Applying preset ${color.magenta(options.resolvable)}.`);
    this.bus.debug(
      `Running the preset applier for ${color.magenta(options.resolvable)} on directory ${color.underline(
        options.target,
      )}.`,
    );
    this.bus.debug(`Command line options: ${color.gray(JSON.stringify(options.options))}`);

    // Resolves the preset resolvable.
    const result = await this.resolver.resolve(options.resolvable, {
      path: options.options.path,
    });

    return Boolean(result);
  }
}
