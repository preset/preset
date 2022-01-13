import { definePreset, extractTemplates } from '@preset/core'

export default definePreset({
	name: 'my-preset',
	flags: {
		// ...
	},
	handler: async() => {
		await extractTemplates()
		// ...
	},
})
