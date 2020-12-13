/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
| This file exposes the importable components of
| this package.
*/

import { color, Preset as StaticPreset } from './exports';

/**
 * The singleton configuration object.
 */
export const Preset = new StaticPreset();

/**
 * Export the colors as well.
 */
export { color };
