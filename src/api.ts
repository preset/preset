import { GeneratorContract } from './Contracts';

export const Preset = {
  make: (preset: GeneratorContract) => preset as GeneratorContract,
};

export { flags } from '@oclif/parser';
