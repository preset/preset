import { definePreset, extractTemplates } from '../../../src/index'

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
