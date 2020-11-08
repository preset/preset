import { inject, injectable } from 'inversify';
import { ApplierContract, ApplierOptionsContract } from '@/Contracts/ApplierContract';
import { ResolverContract } from '@/Contracts/ResolverContract';
import { ImporterContract } from '@/Contracts/ImporterContract';
import { Binding, container, Name } from '@/Container';
import { Bus } from '@/bus';
import { color } from '@/utils';
import { ApplyPresetHandler } from '@/Handlers/ApplyPresetHandler';
import { HandlerContract } from '@/Contracts/HandlerContract';
import { ExecutionError } from '@/Errors';

@injectable()
export class PresetApplier implements ApplierContract {
  @inject(Binding.Resolver)
  protected resolver!: ResolverContract;

  @inject(Binding.Importer)
  protected importer!: ImporterContract;

  @inject(Binding.Bus)
  protected bus!: Bus;

  protected handlers: HandlerContract[] = [
    container.getNamed<ApplyPresetHandler>(Binding.Handler, Name.Handler.ApplyPreset),
    // container.getNamed<ApplyPresetHandler>(Binding.Handler, Name.Handler.ApplyPreset),
  ];

  async run(options: ApplierOptionsContract): Promise<void> {
    this.bus.info(`Applying preset ${color.magenta(options.resolvable)}.`);
    this.bus.debug(`Command line options: ${color.gray(JSON.stringify(options.options))}`);

    // Resolves the given preset resolvable.
    const result = await this.resolver.resolve(options.resolvable, {
      path: options.options.path,
    });

    // Imports the preset configuration.
    const preset = await this.importer.import(result.path);

    // Loops through the action to find their handler and
    // run them, in the order they have been defined.
    for (const action of preset.actions) {
      const handler = this.handlers.find(({ name }) => name === action.handler);

      if (!handler) {
        throw new ExecutionError(`Invalid action ${color.magenta(action.constructor.name)}.`) //
          .stopsExecution()
          .withoutStack();
      }

      this.bus.debug(`Handling a ${color.magenta(action.constructor.name)} action.`);
      this.bus.info(action.title as string); // TODO CONTEXT

      await handler?.handle(action);
    }

    // TODO temp cleanup

    this.bus.success(`${color.magenta(preset.name ?? options.resolvable)} has been applied.`);
  }
}
