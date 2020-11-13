import path from 'path';
import fs from 'fs-extra';
import { ApplierOptionsContract, HandlerContract, Binding, Name, container, Action, Contextualized } from '@/exports';

export const STUB_DIRECTORY = path.join(__dirname, '__stubs__');
export const TARGET_DIRECTORY = path.join(__dirname, '__target__');

export const stubs = {
  HELLO_WORLD: path.join(STUB_DIRECTORY, 'presets', 'hello-world'),
};

export const generateOptions = (resolvable: string, options: Partial<ApplierOptionsContract> = {}): ApplierOptionsContract => {
  return {
    resolvable,
    target: options.target ?? TARGET_DIRECTORY,
    args: options.args ?? [],
    options: {
      ...options.options,
    },
  };
};

export async function sandbox<T extends Promise<any>>(callback: (...any: any) => T): Promise<T> {
  fs.emptyDirSync(TARGET_DIRECTORY);
  const result = await callback();
  fs.emptyDirSync(TARGET_DIRECTORY);
  return result;
}

export function sandboxPath(...paths: string[]): string {
  return path.join(TARGET_DIRECTORY, ...paths);
}

export async function handleInSandbox(
  handlerName: string,
  action: Contextualized<Action>,
  options: ApplierOptionsContract,
  test: (result?: any) => Promise<void> | void,
) {
  return await sandbox(async () => {
    const result = await container.getNamed<HandlerContract>(Binding.Handler, handlerName).handle(action, options);
    await test(result);
  });
}
