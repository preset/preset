import { definePreset, extractTemplates } from '@preset/core'

export default definePreset({
	name: 'preset-with-preset-in-pkg',
	options: {
		install: true,
		git: true,
	},
	handler: async() => {
		await extractTemplates({})
	},
})
