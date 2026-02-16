import { definePreset, extractTemplates } from '@preset/core'
import { randomUUID } from 'node:crypto'

export default definePreset({
	name: 'preset-with-node-import',
	options: {},
	handler: async () => {
		extractTemplates({
			title: randomUUID(),
		})
	},
})
