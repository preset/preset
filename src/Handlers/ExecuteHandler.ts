import { inject, injectable } from 'inversify';
import {
  ApplierOptionsContract,
  Binding,
  Bus,
  color,
  Contextualized,
  Execute,
  execute,
  ExecutionError,
  HandlerContract,
  Name,
} from '@/exports';

@injectable()
export class ExecuteHandler implements HandlerContract {
  public name = Name.Handler.Execute;

  @inject(Binding.Bus)
  protected bus!: Bus;

  async handle(action: Contextualized<Execute>, applierOptions: ApplierOptionsContract): Promise<void> {
    if (!action.commands) {
      throw new ExecutionError() //
        .withMessage(`No command provided for the ${color.magenta('execute')} action.`)
        .withoutStack()
        .stopsExecution();
    }

    if (!Array.isArray(action.commands)) {
      action.commands = [action.commands];
    }

    if (!Array.isArray(action.args)) {
      action.args = [action.args];
    }

    for (const command of action.commands) {
      await this.execute(command, action.args, action.options);
    }
  }

  protected async execute(command: string, args: string[] = [], options: any = {}): Promise<void> {
    try {
      this.bus.debug(`Executing command: ${color.bold().gray(command)} ${color.gray(args.join(' '))}.`);
      await execute(command, args, options);
    } catch (error) {
      throw new ExecutionError() //
        .withMessage(`An error occured while executing ${color.magenta(command)}.`)
        .withCompleteStack(error)
        .stopsExecution();
    }
  }
}
