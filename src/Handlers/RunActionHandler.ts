import { injectable } from 'inversify';
import { ActionHandlerContract, ContextContract, RunActionContract } from '@/Contracts';
import { Logger } from '@/Logger';
import { contextualize, promiseFromProcess } from '.';
import { spawn } from 'cross-spawn';

@injectable()
export class RunActionHandler implements ActionHandlerContract<'run'> {
  for = 'run' as const;

  async validate(action: Partial<RunActionContract>, context: ContextContract): Promise<RunActionContract> {
    action = contextualize(action, context);

    if (!action.command) {
      throw Logger.throw('No command given');
    }

    return {
      ...action,
      command: action.command,
      type: 'run',
    };
  }

  async handle(action: RunActionContract, context: ContextContract) {
    try {
      Logger.info(`Running command: ${action.command}`);

      const process = spawn(action.command, {
        cwd: context.targetDirectory,
      });

      return promiseFromProcess(process, context);
    } catch (error) {
      throw Logger.throw('Run action failed', error);
    }
  }
}
