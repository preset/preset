import { definePreset, extractTemplates } from '@preset/core'

export default definePreset({
	name: 'basic-preset',
	options: {
		install: true,
		git: true,
	},
	handler: async () => {
		await extractTemplates({})
	},
})
