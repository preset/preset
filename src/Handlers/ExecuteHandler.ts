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
  wrap,
} from '@/exports';

@injectable()
export class ExecuteHandler implements HandlerContract {
  public name = Name.Handler.Execute;

  @inject(Binding.Bus)
  protected bus!: Bus;

  async handle(action: Contextualized<Execute>, applierOptions: ApplierOptionsContract): Promise<void> {
    if (!action.command) {
      throw new ExecutionError() //
        .withMessage(`No command provided for the ${color.magenta('execute')} action.`)
        .withoutStack()
        .stopsExecution();
    }

    await this.execute(applierOptions.target, action.command, wrap(action.args), action.options);
  }

  protected async execute(cwd: string, command: string, args: string[] = [], options: any = {}): Promise<void> {
    try {
      this.bus.debug(`Executing command: ${color.bold().gray(command)} ${color.gray(args.join(' '))}.`);
      await execute(cwd, command, args, options);
    } catch (error) {
      throw new ExecutionError() //
        .withMessage(`An error occured while executing ${color.magenta(command)}.`)
        .withCompleteStack(error)
        .stopsExecution();
    }
  }
}
