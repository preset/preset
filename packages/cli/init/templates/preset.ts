import { definePreset, extractTemplates } from '@preset/core'

export default definePreset({
	name: '%presetName%',
	flags: {
		// ...
	},
	handler: async() => {
		await extractTemplates()
		// ...
	},
})
