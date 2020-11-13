import cac from 'cac';
import createClone from 'rfdc';
import { inject, injectable } from 'inversify';
import {
  ApplierContract,
  ApplierOptionsContract,
  ApplyPreset,
  Binding,
  Bus,
  container,
  Contextualized,
  ExecutionError,
  HandlerContract,
  Name,
} from '@/exports';

@injectable()
export class ApplyPresetHandler implements HandlerContract {
  public name = Name.Handler.ApplyPreset;

  @inject(Binding.Bus)
  protected bus!: Bus;

  async handle(action: Contextualized<ApplyPreset>, applierOptions: ApplierOptionsContract): Promise<void> {
    if (!action.resolvable) {
      throw new ExecutionError().stopsExecution().withMessage(`No resolvable specified.`);
    }

    const forwardOptions = createClone({ circles: true, proto: true })(applierOptions);

    // Cleans up the arguments and options if necessary.
    if (!action.shouldInheritArguments) {
      forwardOptions.args = [];
      forwardOptions.options = {};
    }

    // Parses the given arguments and forward them to the preset being applied.
    const { args, options } = cac().parse(['', '', ...action.args]);
    forwardOptions.args.push(...args);
    forwardOptions.options = {
      interaction: false,
      ...options,
    };

    await container.get<ApplierContract>(Binding.Applier).run({
      ...forwardOptions,
      resolvable: action.resolvable,
    });
  }
}
