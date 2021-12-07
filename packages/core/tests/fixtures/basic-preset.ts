import { definePreset, extractTemplates } from '../../src/index'

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
