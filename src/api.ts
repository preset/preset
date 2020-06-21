import { GeneratorContract } from './Contracts';

export const Preset = {
  make: (preset: GeneratorContract) => preset as GeneratorContract,
};

export { Log } from '@/Logger';
export { flags } from '@oclif/parser';
