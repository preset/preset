import { ApplierOptionsContract } from '@/Contracts/ApplierContract';
import { HandlerContract } from '@/Contracts/HandlerContract';
import { Contextualized } from '@/Contracts/PresetContract';
import { ExecuteCommand } from '@/Configuration/Actions';
import { inject, injectable } from 'inversify';
import { Binding, Name } from '@/Container';
import { ExecutionError } from '@/Errors';
import { color, execute } from '@/utils';
import { Bus } from '@/bus';

@injectable()
export class ExecuteCommandHandler implements HandlerContract {
  public name = Name.Handler.ExecuteCommand;

  @inject(Binding.Bus)
  protected bus!: Bus;

  async handle(action: Contextualized<ExecuteCommand>, applierOptions: ApplierOptionsContract): Promise<void> {
    if (!action.command) {
      throw new ExecutionError() //
        .withMessage(`No command provided for the ${color.magenta('execute')} action.`)
        .withoutStack()
        .stopsExecution();
    }

    if (!Array.isArray(action.args)) {
      action.args = [action.args];
    }

    try {
      this.bus.debug(`Executing command: ${color.bold().gray(action.command)} ${color.gray(action.args.join(' '))}.`);
      await execute(action.command, action.args, action.options);
    } catch (error) {
      throw new ExecutionError() //
        .withMessage(`An error occured while executing ${color.magenta(action.command)}.`)
        .withCompleteStack(error)
        .stopsExecution();
    }
  }
}
