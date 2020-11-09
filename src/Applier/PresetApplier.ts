import { inject, injectable } from 'inversify';
import { ApplierContract, ApplierOptionsContract } from '@/Contracts/ApplierContract';
import { ResolverContract, ResolverResult } from '@/Contracts/ResolverContract';
import { ImporterContract } from '@/Contracts/ImporterContract';
import { Binding, container, Name } from '@/Container';
import { Bus } from '@/bus';
import { color, contextualizeAction, contextualizeValue } from '@/utils';
import { ApplyPresetHandler } from '@/Handlers/ApplyPresetHandler';
import { HandlerContract } from '@/Contracts/HandlerContract';
import { ExecutionError } from '@/Errors';
import simpleGit from 'simple-git';
import fs from 'fs-extra';

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

  async run(applierOptions: ApplierOptionsContract): Promise<void> {
    this.bus.info(`Applying preset ${color.magenta(applierOptions.resolvable)}.`);
    this.bus.debug(`Command line options: ${color.gray(JSON.stringify(applierOptions.options))}`);

    // Resolves the given preset resolvable.
    const resolved = await this.resolver.resolve(applierOptions.resolvable, {
      path: applierOptions.options.path,
    });

    // Imports the preset configuration.
    const preset = await this.importer.import(resolved.path);

    // Defines the preset's context
    preset.options = applierOptions.options;
    preset.args = applierOptions.args;
    preset.git = {
      instance: simpleGit(process.cwd()),
      config: (await simpleGit().listConfig()).all,
    };

    // Loops through the action to find their handler and
    // run them, in the order they have been defined.
    for (const uncontextualizedAction of preset.actions) {
      const action = contextualizeAction(uncontextualizedAction);
      const handler = this.handlers.find(({ name }) => name === action.handler);

      if (!handler) {
        throw new ExecutionError(`Invalid action ${color.magenta(action.constructor.name)}.`) //
          .stopsExecution()
          .withoutStack();
      }

      this.bus.debug(`Handling a ${color.magenta(action.constructor.name)} action.`);
      this.bus.info(action.title as string);

      await handler?.handle(action, applierOptions);
    }

    this.bus.success(`${color.magenta(contextualizeValue(preset.name) ?? applierOptions.resolvable)} has been applied.`);
    this.cleanUp(resolved);
  }

  /**
   * Cleans up the temporary directory if needed.
   */
  protected cleanUp({ path, temporary }: ResolverResult): void {
    if (!temporary) {
      return;
    }

    this.bus.debug(`Deleting ${color.underline(path)}.`);

    try {
      fs.emptyDirSync(path);
      fs.rmdirSync(path);
    } catch (error) {
      throw new ExecutionError() //
        .withMessage('Could not clean up temporary files.')
        .withCompleteStack(error)
        .recoverable();
    }
  }
}
