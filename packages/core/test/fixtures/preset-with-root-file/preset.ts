import { definePreset, extractTemplates } from '@preset/core'

export default definePreset({
	name: 'preset-with-root-file',
	flags: {
		install: true,
		git: true,
	},
	handler: async() => {
		await extractTemplates({})
	},
})
