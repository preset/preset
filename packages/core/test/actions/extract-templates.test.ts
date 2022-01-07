import { it, expect } from 'vitest'
import { extractTemplates, emitter } from '../../src'
import { usingSandbox, expectStructureMatches } from '../utils'

it('extracts the templates directory to the target directory', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({ handler: async() => await extractTemplates() })

		await executePreset()
		await expectStructureMatches(targetDirectory, { 'file.txt': { type: 'file' } })
	},
	rootStructure: { 'templates/file.txt': { type: 'file' } },
}))

it('extracts a custom templates directory to the target directory', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({ handler: async() => await extractTemplates({ templates: 'data/my-templates' }) })

		await executePreset()
		await expectStructureMatches(targetDirectory, { 'file.txt': { type: 'file' } })
	},
	rootStructure: { 'data/my-templates/file.txt': { type: 'file' } },
}))

it('does not extract actual dotfiles by default', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({ handler: async() => await extractTemplates() })

		await executePreset()
		await expectStructureMatches(targetDirectory, {})
	},
	rootStructure: { 'templates/.gitkeep': { type: 'file' } },
}))

it('extracts actual dotfiles{ when `extractDotFiles` is true', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({ handler: async() => await extractTemplates({ extractDotFiles: true }) })

		await executePreset()
		await expectStructureMatches(targetDirectory, { '.gitkeep': { type: 'file' } })
	},
	rootStructure: { 'templates/.gitkeep': { type: 'file' } },
}))

it('extracts files with the .dotfile extension as actual dotfiles', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({ handler: async() => await extractTemplates() })

		await executePreset()
		await expectStructureMatches(targetDirectory, {
			'.gitkeep': { type: 'file' },
			'nested': { type: 'directory' },
			'nested/.gitkeep': { type: 'file' },
		})
	},
	rootStructure: {
		'templates/.gitignore': { type: 'file' },
		'templates/gitkeep.dotfile': { type: 'file' },
		'templates/nested/gitkeep.dotfile': { type: 'file' },
	},
}))

it('extracts files from a custom location inside the templates directory', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({ handler: async() => await extractTemplates({ from: 'default' }) })

		await executePreset()
		await expectStructureMatches(targetDirectory, {
			'default.txt': { type: 'file' },
			'nested': { type: 'directory' },
			'nested/file.txt': { type: 'file' },
		})
	},
	rootStructure: {
		'templates/file.txt': { type: 'file' },
		'templates/default/default.txt': { type: 'file' },
		'templates/default/nested/file.txt': { type: 'file' },
	},
}))

it('skips extractions to files that exist', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({ handler: async() => await extractTemplates({ whenConflict: 'skip' }) })

		await executePreset()
		await expectStructureMatches(targetDirectory, {
			'default.txt': { type: 'file', content: 'Komi is best girl' },
		})
	},
	rootStructure: { 'templates/default.txt': { type: 'file', content: 'Astolfo is best girl' } },
	targetStructure: { 'default.txt': { type: 'file', content: 'Komi is best girl' } },
}))

it('overrides files that exist', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({ handler: async() => await extractTemplates({ whenConflict: 'override' }) })

		await executePreset()
		await expectStructureMatches(targetDirectory, {
			'default.txt': { type: 'file', content: 'Kurisu is best girl' },
		})
	},
	rootStructure: { 'templates/default.txt': { type: 'file', content: 'Kurisu is best girl' } },
	targetStructure: { 'default.txt': { type: 'file', content: 'Komi is best girl' } },
}))

it('extracts a specific file into a specific directory when that directory is used as target', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({
			handler: async() => await extractTemplates({
				from: 'vite.php',
				to: 'config',
			}),
		})

		await executePreset()
		await expectStructureMatches(targetDirectory, {
			'config/vite.php': { type: 'file' },
		})
	},
	rootStructure: { 'templates/vite.php': { type: 'file' } },
	targetStructure: { config: { type: 'directory' } },
}))

it('fails when trying to extract a directory to a file', async() => await usingSandbox({
	fn: async(_, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({ handler: async() => await extractTemplates({ to: 'file.txt' }) })
		const execution: any = {}

		emitter.on('action:fail', (context) => execution.context = context)
		execution.result = await executePreset()

		expect(execution.result).toBe(false)
		expect(execution.context?.name).toBe('extract-templates')
		expect(execution.context?.error).toBeInstanceOf(Error)
	},
	rootStructure: { 'templates/another-file.txt': { type: 'file' } },
	targetStructure: { 'file.txt': { type: 'file' } },
}))

it('extracts a single nested file to the target directory', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({
			handler: async() => await extractTemplates({
				from: 'nested/gitignore.dotfile',
				flatten: true,
			}),
		})

		await executePreset()
		await expectStructureMatches(targetDirectory, { '.gitignore': { type: 'file' } })
	},
	rootStructure: { 'templates/nested/gitignore.dotfile': { type: 'file' } },
}))

it('extracts glob-based files to the target directory', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({ handler: async() => await extractTemplates({ from: 'php/**/*.php' }) })

		await executePreset()
		await expectStructureMatches(targetDirectory, {
			'php/index.html': { type: 'none' },
			'php/index.php': { type: 'file' },
			'php/config/vite.php': { type: 'file' },
		})
	},
	rootStructure: {
		'templates/php/index.html': { type: 'file' },
		'templates/php/index.php': { type: 'file' },
		'templates/php/config/vite.php': { type: 'file' },
	},
}))
