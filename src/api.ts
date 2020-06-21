import { GeneratorContract } from './Contracts';
import { Log } from './Logger';

export const Preset = {
  make: (preset: GeneratorContract) => preset as GeneratorContract,
};

export const Logger = {
  info: (message: string, ...args: string[]) => Log.info(message, ...args) as any,
  success: (message: string, ...args: string[]) => Log.success(message, ...args) as any,
  fatal: (message: string, ...args: string[]) => Log.fatal(message, ...args) as any,
};

export { flags } from '@oclif/parser';
