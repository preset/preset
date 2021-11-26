import { createPresetContext } from './context'
import type { Preset, ApplyOptions } from './types'

export async function applyPreset(options: ApplyOptions) {
	// resolve
	// TODO

	// cache
	// TODO

	// import
	// TODO
	const preset = null as unknown as Preset

	// create context
	const context = await createPresetContext(preset, {
		args: options.args,
		targetDirectory: options.targetDirectory,
	})

	// apply
	await preset.apply(context)
}
