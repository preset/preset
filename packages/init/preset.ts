import path from 'node:path'
import { definePreset, applyNestedPreset } from '@preset/core'

export default definePreset({
	name: 'preset:initialize',
	flags: {
		install: true,
		git: true,
	},
	handler: async(context) => {
		await applyNestedPreset({ resolvable: path.resolve(__dirname, './nested-preset.ts') })
		// const presetName = 'test' // await prompt('What is the name of the preset', ({ targetDirectory }) => path.basename(targetDirectory))
		// const kebabPresetName = presetName
		// 	.match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)!
		// 	.filter(Boolean)
		// 	.map((x: string) => x.toLowerCase())
		// 	.join('-')
		// 	.replace(/'/, "\\'")

		// await extractTemplates({})
		// await editFiles({
		// 	files: '**/**',
		// 	replaceVariables: {
		// 		kebabPresetName,
		// 		presetName: presetName.replace(/'/, "\\'"),
		// 		author: context.git.config['user.name'] ?? '',
		// 	},
		// })

		// if (context.options.install) {
		// 	await installDependencies()
		// }

		// if (context.options.git) {
		// 	await shell('git init')
		// 	await shell('git add .')
		// 	await shell('git commit -m "chore: initialize preset"')
		// }
	},
})
