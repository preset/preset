import { Preset as StaticPreset } from './Configuration/Preset';

export * from './Contracts/PresetContract';
export { color } from './utils';
export const Preset = new StaticPreset();
