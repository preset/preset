import { definePreset, editFiles, extractTemplates, installPackages, executeCommand } from '@preset/core'

export default definePreset({
	name: 'preset:initialize',
	flags: {
		install: true,
		git: true,
	},
	handler: async(context) => {
		// const presetName = 'test' // await prompt('What is the name of the preset', ({ targetDirectory }) => path.basename(targetDirectory))
		// const kebabPresetName = presetName
		// 	.match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)!
		// 	.filter(Boolean)
		// 	.map((x: string) => x.toLowerCase())
		// 	.join('-')
		// 	.replace(/'/, "\\'")

		await extractTemplates()

		await editFiles({
			files: '**/**',
			operations: [
				{
					type: 'replace-variables',
					variables: {
						author: context.git.config['user.name'] as string,
					},
				},
			],
		})

		if (context.options.install) {
			await installPackages({ for: 'node', install: '@preset/core' })
		}

		if (context.options.git) {
			await executeCommand({ command: 'git', arguments: ['init'] })
			await executeCommand({ command: 'git', arguments: ['add', '.'] })
			await executeCommand({ command: 'git', arguments: ['commit', '-m', 'chore: initialize preset'] })
		}
	},
})
