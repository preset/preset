import { definePreset, extractTemplates } from '@preset/core'

export default definePreset({
	name: 'preset-with-preset-in-pkg',
	flags: {
		install: true,
		git: true,
	},
	handler: async() => {
		await extractTemplates({})
	},
})
