import { definePreset, extractTemplate } from '@preset/core'

export default definePreset({
	name: '%presetName%',
	flags: {
		// ...
	},
	handler: async() => {
		await extractTemplate()
		// ...
	},
})
