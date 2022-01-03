import path from 'node:path'
import { applyNestedPreset, definePreset, extractTemplates } from '@preset/core'

export default definePreset({
	name: 'preset:nested-initialize-preset',
	handler: async(context) => {
		if (context.args[0] === 'fail') {
			await extractTemplates({})
		}

		if (context.args[0] === 'nest') {
			await applyNestedPreset({ resolvable: path.resolve(__dirname, './nested-preset.ts') })
		}
	},
})
