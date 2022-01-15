import { definePreset, editFiles, extractTemplates, installPackages, executeCommand } from '@preset/core'

export default definePreset({
	name: 'preset:initialize',
	options: {
		install: true,
		git: true,
	},
	handler: async(context) => {
		// TODO prompt
		// const presetName = 'test' // await prompt('What is the name of the preset', ({ targetDirectory }) => path.basename(targetDirectory))
		// const kebabPresetName = presetName
		// 	.match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)!
		// 	.filter(Boolean)
		// 	.map((x: string) => x.toLowerCase())
		// 	.join('-')
		// 	.replace(/'/, "\\'")

		await extractTemplates({ title: 'extract templates' })

		await editFiles({
			files: '**/**',
			operations: [
				{
					type: 'replace-variables',
					variables: {
						author: context.git.config['user.name'] as string,
						email: context.git.config['user.email'] as string,
					},
				},
			],
			title: 'replace variables',
		})

		if (context.options.install) {
			await installPackages({ for: 'node', install: '@preset/core', dev: true, title: 'install typings' })
		}

		if (context.options.git) {
			// TODO: await group()
			await executeCommand({ command: 'git', arguments: ['init'], title: 'initialize repository' })
			await executeCommand({ command: 'git', arguments: ['add', '.'], ignoreExitCode: true, title: 'stage preset files' })
			await executeCommand({ command: 'git', arguments: ['commit', '-m', '"chore: initialize preset"'], ignoreExitCode: true, title: 'make first commit' })
		}
	},
})
