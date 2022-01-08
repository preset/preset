import { it } from 'vitest'
import { installPackages } from '../../src'
import { usingSandbox, expectStructureMatches } from '../utils'

it('install the given php packages', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({
			handler: async() => await installPackages({
				for: 'php',
				install: 'innocenzi/laravel-vite:^0.1.20',
			}),
		})

		await executePreset()
		await expectStructureMatches(targetDirectory, {
			'vendor': { type: 'directory' },
			'vendor/innocenzi/laravel-vite': { type: 'directory' },
			'composer.lock': { type: 'file' },
			'composer.json': {
				type: 'file',
				json: {
					require: {
						'innocenzi/laravel-vite': '^0.1.20',
					},
				},
			},
		})
	},
}))

it('install the given php packages as development dependencies', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({
			handler: async() => await installPackages({
				for: 'php',
				install: 'innocenzi/laravel-vite:^0.1.20',
				dev: true,
			}),
		})

		await executePreset()
		await expectStructureMatches(targetDirectory, {
			'vendor': { type: 'directory' },
			'vendor/innocenzi/laravel-vite': { type: 'directory' },
			'composer.lock': { type: 'file' },
			'composer.json': {
				type: 'file',
				json: {
					'require-dev': {
						'innocenzi/laravel-vite': '^0.1.20',
					},
				},
			},
		})
	},
}))

it('install the given node packages', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({
			handler: async() => await installPackages({
				for: 'node',
				install: 'debug@^4.3.3',
			}),
		})

		await executePreset()
		await expectStructureMatches(targetDirectory, {
			'node_modules': { type: 'directory' },
			'node_modules/debug': { type: 'directory' },
			'package-lock.json': { type: 'file' },
			'package.json': {
				type: 'file',
				json: {
					dependencies: {
						debug: '^4.3.3',
					},
				},
			},
		})
	},
	targetStructure: { 'package.json': { type: 'file', content: '{}' } }, // necessary so it's not installed in the first package.json directory
}))

it('install the given node packages as development dependencies', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({
			handler: async() => await installPackages({
				for: 'node',
				install: 'debug@^4.3.3',
				dev: true,
			}),
		})

		await executePreset()
		await expectStructureMatches(targetDirectory, {
			'node_modules': { type: 'directory' },
			'node_modules/debug': { type: 'directory' },
			'package-lock.json': { type: 'file' },
			'package.json': {
				type: 'file',
				json: {
					devDependencies: {
						debug: '^4.3.3',
					},
				},
			},
		})
	},
	targetStructure: { 'package.json': { type: 'file', content: '{}' } }, // necessary so it's not installed in the first package.json directory
}))

it('install the given node packages with the specified package manager', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({
			handler: async() => await installPackages({
				for: 'node',
				install: 'debug@^4.3.3',
				packageManager: 'pnpm',
			}),
		})

		await executePreset()
		await expectStructureMatches(targetDirectory, {
			'node_modules': { type: 'directory' },
			'node_modules/debug': { type: 'directory' },
			'package.json': {
				type: 'file',
				json: {
					dependencies: {
						debug: '^4.3.3',
					},
				},
			},
		})
	},
	targetStructure: { 'package.json': { type: 'file', content: '{}' } }, // necessary so it's not installed in the first package.json directory
}))
