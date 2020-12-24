import fs from 'fs-extra';
import simpleGit from 'simple-git';
import { inject, injectable } from 'inversify';
import {
  Action,
  ApplierContract,
  ApplierOptionsContract,
  Binding,
  Bus,
  color,
  container,
  contextualizeObject,
  contextualizeValue,
  ExecutionError,
  HandlerContract,
  ImporterContract,
  Preset,
  cachePreset,
  ResolverContract,
  PresetLocation,
  wrap,
} from '@/exports';

@injectable()
export class PresetApplier implements ApplierContract {
  @inject(Binding.Resolver)
  protected resolver!: ResolverContract;

  @inject(Binding.Importer)
  protected importer!: ImporterContract;

  @inject(Binding.Bus)
  protected bus!: Bus;

  async run(applierOptions: ApplierOptionsContract): Promise<void> {
    this.bus.info(`Applying preset ${color.magenta(applierOptions.resolvable)}.`);
    this.bus.debug(`Target directory: ${color.gray(JSON.stringify(applierOptions.target))}`);
    this.bus.debug(`Command line options: ${color.gray(JSON.stringify(applierOptions.options))}`);
    this.bus.debug(`Command line arguments: ${color.gray(JSON.stringify(applierOptions.args))}`);

    // Resolves the given preset resolvable.
    const resolved = await this.resolver.resolve(applierOptions.resolvable, {
      path: applierOptions.options.path,
      ssh: applierOptions.options.ssh,
    });

    // Imports the preset configuration.
    const preset = cachePreset(resolved.path, await this.importer.import(resolved.path));

    // Defines the preset's context
    preset.context ??= {};
    preset.presetDirectory = resolved.path;
    preset.targetDirectory = applierOptions.target;
    preset.options = { ...preset.options, ...applierOptions.options };
    preset.args = applierOptions.args;
    preset.git = {
      instance: simpleGit(process.cwd()),
      config: (await simpleGit().listConfig()).all,
    };

    this.bus.debug('Steps: ' + color.gray(preset.actions.map(({ name }) => name).join(', ')) || color.red('none'));

    await this.performActions(preset, applierOptions);
    this.bus.success(`${color.magenta(contextualizeValue(preset, preset.name) ?? applierOptions.resolvable)} has been applied.`);

    // Displays instructions
    if (preset.instructions && preset.isInteractive()) {
      this.bus.instruct(
        wrap(contextualizeValue(preset, preset.instructions.messages)),
        contextualizeValue(preset, preset.instructions.heading),
      );
    }

    // Cleans up temporary files
    this.cleanUp(resolved);
  }

  /**
   * Performs the actions.
   */
  public async performActions(preset: Preset, applierOptions: ApplierOptionsContract): Promise<void> {
    // Creates a map of the actions with their handlers.
    const actions: Map<Action, HandlerContract> = new Map();

    // Validates the actions before executing them.
    // If an action has no handler, the preset won't be applied.
    for (const uncontextualizedAction of preset.actions) {
      const action = uncontextualizedAction;
      const handler = container.getAll<HandlerContract>(Binding.Handler).find(({ name }) => name === action.handler);

      if (!handler) {
        const name = contextualizeValue(preset, action.name) ?? action.constructor.name;
        throw new ExecutionError(`Action at index ${color.magenta(actions.size.toString())} (${color.magenta(name)}) is not valid.`) //
          .stopsExecution()
          .withoutStack();
      }

      actions.set(action, handler);
    }

    // Loops through the action to find their handler and
    // run them, in the order they have been defined.
    for (const [uncontextualizedAction, handler] of actions) {
      const action = contextualizeObject(preset, uncontextualizedAction);

      const shouldRun = !action.conditions.some((condition) => {
        return !Boolean(contextualizeValue(preset, condition));
      });

      if (!shouldRun) {
        this.bus.debug(`Skipped a ${color.magenta(action.name)} because one of the conditions did not pass.`);
        continue;
      }

      this.bus.debug(`Handling a ${color.magenta(action.name)}.`);

      if (action.title !== false) {
        this.bus.info(action.title ?? `Performing a ${color.magenta(action.name)}...`);
      }

      await handler.handle(action, applierOptions);
    }
  }

  /**
   * Cleans up the temporary directory if needed.
   */
  protected cleanUp({ path, temporary }: PresetLocation): void {
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
