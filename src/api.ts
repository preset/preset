import { GeneratorContract } from './Contracts';
import { Log as Logger, Color } from './Logger';

export const Preset = {
  make: (preset: GeneratorContract) => preset as GeneratorContract,
};

export const Log = {
  colors: Logger.colors,
  info: (message: string, ...args: string[]) => Logger.info(message, ...args) as any,
  success: (message: string, ...args: string[]) => Logger.success(message, ...args) as any,
  fatal: (message: string, ...args: string[]) => Logger.fatal(message, ...args) as any,
};

export { flags } from '@oclif/parser';

export * as fs from 'fs-extra';
export * as fetch from 'node-fetch';
export * as tmp from 'tmp';
