import { GeneratorContract } from './Contracts';
import { Logger } from '@poppinss/fancy-logs';
import { Colors } from '@poppinss/colors';

export const Color = new Colors();
export const Log = new Logger();
export const Preset = {
  make: (preset: GeneratorContract) => preset as GeneratorContract,
};

export { flags } from '@oclif/parser';
