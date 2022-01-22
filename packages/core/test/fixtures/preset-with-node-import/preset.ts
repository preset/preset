import { randomUUID } from 'node:crypto'
import { definePreset, extractTemplates } from '@preset/core'

export default definePreset({
	name: 'preset-with-node-import',
	options: {},
	handler: async() => {
		extractTemplates({
			title: randomUUID(),
		})
	},
})
