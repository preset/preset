import type { ApplyOptions } from './types'
import { createPresetContext } from './context'
import { importPresetFile } from './import'
import { resolvePreset } from './resolve'
import { debug } from './utils'

/**
 * Applies the given preset.
 */
export async function applyPreset(options: ApplyOptions) {
	debug.apply(`Applying preset ${options.resolvable} into ${options.targetDirectory}.`)

	const presetFile = await resolvePreset(options)
	const preset = await importPresetFile(presetFile)
	const context = await createPresetContext(preset, options)

	return await preset.apply(context)
}
