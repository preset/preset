import path from 'path';
import fs from 'fs-extra';
import { ApplierOptionsContract } from '@/Contracts/ApplierContract';

export const STUB_DIRECTORY = path.join(__dirname, '__stubs__');
export const TARGET_DIRECTORY = path.join(__dirname, '__target__');

export const stubs = {
  HELLO_WORLD: path.join(STUB_DIRECTORY, 'hello-world'),
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

export const sandbox = (callback: Function) => {
  fs.emptyDirSync(TARGET_DIRECTORY);
  callback();
  fs.emptyDirSync(TARGET_DIRECTORY);
};
