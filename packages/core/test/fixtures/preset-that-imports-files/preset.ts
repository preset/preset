import { definePreset, extractTemplates } from '@preset/core'
import { invoke } from './utils'

export default invoke(() => definePreset({
	name: 'preset-that-imports-files',
	options: {
		install: true,
		git: true,
	},
	handler: async() => {
		await extractTemplates({})
	},
}))
