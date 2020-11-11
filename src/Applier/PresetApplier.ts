import { ApplierContract, ApplierOptionsContract } from '@/Contracts/ApplierContract';
import { ResolverContract, ResolverResult } from '@/Contracts/ResolverContract';
import { color, contextualizeAction, contextualizeValue } from '@/utils';
import { ImporterContract } from '@/Contracts/ImporterContract';
import { HandlerContract } from '@/Contracts/HandlerContract';
import { Contextualized } from '@/Contracts/PresetContract';
import { Binding, container } from '@/Container';
import { Action } from '@/Configuration/Action';
import { inject, injectable } from 'inversify';
import { ExecutionError } from '@/Errors';
import simpleGit from 'simple-git';
import { Bus } from '@/bus';
import fs from 'fs-extra';

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
    this.bus.debug(`Command line options: ${color.gray(JSON.stringify(applierOptions.options))}`);

    // Resolves the given preset resolvable.
    const resolved = await this.resolver.resolve(applierOptions.resolvable, {
      path: applierOptions.options.path,
    });

    // Imports the preset configuration.
    const preset = await this.importer.import(resolved.path);

    // Defines the preset's context
    preset.presetDirectory = resolved.path;
    preset.options = { ...preset.options, ...applierOptions.options };
    preset.args = applierOptions.args;
    preset.git = {
      instance: simpleGit(process.cwd()),
      config: (await simpleGit().listConfig()).all,
    };

    // Creates a map of the actions with their handlers.
    const actions: Map<Contextualized<Action>, HandlerContract> = new Map();

    // Validates the actions before executing them.
    // If an action has no handler, the preset won't be applied.
    for (const uncontextualizedAction of preset.actions) {
      const action = contextualizeAction(uncontextualizedAction);
      const handler = container.getAll<HandlerContract>(Binding.Handler).find(({ name }) => name === action.handler);

      if (!handler) {
        const name = action.name ?? action.constructor.name;
        throw new ExecutionError(`Action at index ${color.magenta(actions.size.toString())} (${color.magenta(name)}) is not valid.`) //
          .stopsExecution()
          .withoutStack();
      }

      actions.set(action, handler);
    }

    // Loops through the action to find their handler and
    // run them, in the order they have been defined.
    for (const [action, handler] of actions) {
      const shouldRun = !action.conditions.some((condition) => {
        return !Boolean(contextualizeValue(condition));
      });

      if (!shouldRun) {
        this.bus.debug(`Skipped a ${color.magenta(action.name)} because one of the conditions did not pass.`);
        continue;
      }

      this.bus.debug(`Handling a ${color.magenta(action.name)}.`);
      this.bus.info(action.title ?? `Performing a ${color.magenta(action.name)}...`);
      await handler.handle(action, applierOptions);
    }

    this.bus.success(`${color.magenta(contextualizeValue(preset.name) ?? applierOptions.resolvable)} has been applied.`);

    // Displays instructions
    if (preset.instructions) {
      this.bus.instruct(preset.instructions.messages, preset.instructions.heading);
    }

    // Cleans up temporary files
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
