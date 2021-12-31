import { definePreset, extractTemplates } from '@preset/core'

export default definePreset({
	name: 'basic-preset',
	flags: {
		install: true,
		git: true,
	},
	handler: async() => {
		await extractTemplates({})
	},
})
