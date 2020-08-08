import { ActionHandlingResult } from '@/Contracts/ActionHandlerContract';
import { ChildProcess } from 'child_process';
import { Text } from '@supportjs/text';
import { Logger } from '@/Logger';
import { ContextContract } from '@/Contracts';

export * from './CopyActionHandler';
export * from './DeleteActionHandler';
export * from './PromptActionHandler';
export * from './EditJsonActionHandler';
export * from './CustomActionHandler';
export * from './EditActionHandler';
export * from './PresetActionHandler';
export * from './RunActionHandler';
export * from './InstallDependenciesActionHandler';

export function contextualize<T extends { [key: string]: any }>(action: T, context: any): T {
  const result = Object.entries(action)
    .map(([name, value]) => {
      if (!!(value && value.constructor && value.call && value.apply)) {
        return { [name]: value(context) };
      }
      return { [name]: value };
    })
    .reduce((acc, val) => ({ ...acc, ...val }));

  return result as T;
}

export function promiseFromProcess(process?: ChildProcess, context?: ContextContract): Promise<ActionHandlingResult> {
  return new Promise((resolve, reject) => {
    let lastData: string | undefined = undefined;

    process?.stdout?.on('data', message => {
      message = Text.make(message).beforeLast('\n').str();

      if (context?.task) {
        context.task.output = message;
      }

      lastData = message;
      Logger.info(message);
    });

    process?.stderr?.on('data', message => {
      message = Text.make(message).beforeLast('\n').str();

      if (context?.task) {
        context.task.output = message;
      }

      lastData = message;
      Logger.info(Text.make(message).beforeLast('\n').str());
    });

    process?.on('error', error => {
      Logger.error(error);
      reject(new Error(lastData));
    });

    process?.on('close', code => {
      Logger.info(`Command terminated with code ${code}`);
      resolve({ success: code === 0 });
    });
  });
}
