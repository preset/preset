import { Binding, container } from '@/Container';
import { Preset as StaticPreset } from './Configuration/Preset';

export { color } from './utils';

/**
 * The singletone configuration object.
 */
export const Preset = container.get<StaticPreset>(Binding.Preset);
