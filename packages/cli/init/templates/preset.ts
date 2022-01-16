import { definePreset, extractTemplates } from '@preset/core'

export default definePreset({
	name: '@@presetName',
	options: {
		// ...
	},
	handler: async() => {
		await extractTemplates()
		// ...
	},
})
