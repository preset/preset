import { definePreset, extractTemplates } from '@preset/core'

export default definePreset({
	name: 'my-preset',
	options: {
		// ...
	},
	handler: async() => {
		await extractTemplates()
		// ...
	},
})
