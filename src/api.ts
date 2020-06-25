import { GeneratorContract } from './Contracts';
import { Logger } from '@poppinss/fancy-logs';
import { Colors } from '@poppinss/colors';
import { Prompt as BasePrompt } from '@poppinss/prompts';

export const Color = new Colors();
export const Log = new Logger();
export const Prompt = new BasePrompt();
export const Preset = {
  make: (preset: GeneratorContract) => preset as GeneratorContract,
};

export { flags } from '@oclif/parser';
