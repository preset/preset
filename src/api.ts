/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
| This file exposes the importable components of
| this package.
*/

import { Binding, color, container, Preset as StaticPreset } from '@/exports';

/**
 * The singletone configuration object.
 */
export const Preset = container.get<StaticPreset>(Binding.Preset);

/**
 * Export the colors as well.
 */
export { color };
