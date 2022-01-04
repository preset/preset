import { definePreset } from '../src'
import { createPresetContext } from '../src/context'
import type { PresetHandler } from '../src'

export const makeTestPreset = async(handler: PresetHandler) => {
	const preset = definePreset({
		name: 'test-preset',
		flags: {
			auth: true,
		},
		handler,
	})

	const context = await createPresetContext(preset, {
		resolvable: '',
		args: [],
		targetDirectory: '',
	})

	return { preset, context }
}
