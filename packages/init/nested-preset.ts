import { definePreset } from '@preset/core'

export default definePreset({
	name: 'preset:nested-initialize-preset',
	handler: async(context) => {
		// await extractTemplates({ title: 'template extraction', to: 'som directory' })

		if (context.args[0] === 'fail') {
			throw new Error('Failed on purpose')
		}
	},
})
