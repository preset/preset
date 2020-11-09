import { HandlerContract } from '@/Contracts/HandlerContract';
import { ApplyPreset } from '@/Configuration/Actions';
import { inject, injectable } from 'inversify';
import { Binding, container, Name } from '@/Container';
import { ApplierContract, ApplierOptionsContract } from '@/Contracts/ApplierContract';
import { ExecutionError } from '@/Errors';
import { Bus } from '@/bus';
import createClone from 'rfdc';
import cac from 'cac';

@injectable()
export class ApplyPresetHandler implements HandlerContract {
  public name = Name.Handler.ApplyPreset;

  @inject(Binding.Bus)
  protected bus!: Bus;

  async handle(action: ApplyPreset, applierOptions: ApplierOptionsContract): Promise<void> {
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
    const { args, options } = cac().parse(['', '', ...(<string[]>action.args)]);
    forwardOptions.args.push(...args);
    forwardOptions.options = {
      interaction: false,
      ...options,
    };

    console.log(forwardOptions);

    await container.get<ApplierContract>(Binding.Applier).run({
      ...forwardOptions,
      resolvable: <string>action.resolvable,
    });
  }
}
