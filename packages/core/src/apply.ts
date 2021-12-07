import type { ApplyOptions } from './types'
import { createPresetContext } from './context'
import { importPresetFile } from './import'
import { resolvePreset } from './resolve'
import { debug } from './utils'

/**
 * Applies the given preset.
 */
export async function applyPreset(options: ApplyOptions) {
	try {
		debug.apply(`Applying preset ${options.resolvable} into ${options.targetDirectory}.`)

		const presetFile = await resolvePreset(options.resolvable)
		const preset = await importPresetFile(presetFile)
		const context = await createPresetContext(preset, {
			args: options.args,
			targetDirectory: options.targetDirectory,
		})

		await preset.apply(context)
	} catch (error) {
		debug.apply('Preset application failed.')
		debug.apply(error)
	}
}
