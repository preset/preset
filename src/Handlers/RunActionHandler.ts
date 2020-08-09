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

    if (action.options && typeof action.options !== 'object') {
      throw Logger.throw('Options must be an object.');
    }

    if (action.arguments && !Array.isArray(action.arguments)) {
      action.arguments = [action.arguments];
    }

    return {
      ...action,
      command: action.command,
      arguments: action.arguments ?? [],
      type: 'run',
    };
  }

  async handle(action: RunActionContract, context: ContextContract) {
    try {
      Logger.info(`Running command: ${action.command} ${action.arguments.join(' ')}`);

      const process = spawn(action.command, action.arguments, {
        ...action.options,
        cwd: context.targetDirectory,
      });

      if (action.hook) {
        await action.hook(process);
      }

      return await promiseFromProcess(process, context);
    } catch (error) {
      throw Logger.throw('Run action failed', error);
    }
  }
}
