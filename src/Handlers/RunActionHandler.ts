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

    if (action.hook && typeof action.hook !== 'function') {
      throw Logger.throw('Process hook must be a function.');
    }

    if (typeof action.options !== 'object') {
      action.options = {
        stdio: ['ignore', 'pipe', 'pipe'],
      };
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
        ...action.options,
        cwd: context.targetDirectory,
      });

      if (action.hook) {
        await action.hook(process);
      }

      return promiseFromProcess(process, context);
    } catch (error) {
      throw Logger.throw('Run action failed', error);
    }
  }
}
