import { it } from 'vitest'
import { installPackages } from '../../src'
import { usingSandbox, expectStructureMatches } from '../utils'

it('installs the given php package', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({
			handler: async() => await installPackages({
				for: 'php',
				packages: 'innocenzi/laravel-vite:^0.1.20',
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

it('installs the given php package as development dependencies', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({
			handler: async() => await installPackages({
				for: 'php',
				packages: 'innocenzi/laravel-vite:^0.1.20',
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

it('installs the given node package with npm by default', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({
			handler: async() => await installPackages({
				for: 'node',
				packages: 'debug@4.3.3',
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

it('installs the given node package as development dependencies', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({
			handler: async() => await installPackages({
				for: 'node',
				packages: 'debug@4.3.3',
				packageManager: 'npm',
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

it('installs the given node package with the specified package manager', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({
			handler: async() => await installPackages({
				for: 'node',
				packages: 'debug@4.3.3',
				packageManager: 'pnpm',
			}),
		})

		await executePreset()
		await expectStructureMatches(targetDirectory, {
			'node_modules': { type: 'directory' },
			'node_modules/debug': { type: 'directory' },
			'pnpm-lock.yaml': { type: 'file' },
			'package.json': {
				type: 'file',
				json: {
					dependencies: {
						debug: '4.3.3',
					},
				},
			},
		})
	},
	targetStructure: {
		'package.json': { type: 'file', content: '{}' },
		'.npmrc': { type: 'file', content: 'shared-workspace-lockfile=false' },
	}, // necessary so it's not installed in the first package.json directory
}))

it('installs the given packages at once', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({
			handler: async() => await installPackages({
				for: 'node',
				packages: ['debug@4.3.3', 'picocolors@1.0.0'],
				packageManager: 'npm',
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
						picocolors: '^1.0.0',
					},
				},
			},
		})
	},
	targetStructure: { 'package.json': { type: 'file', content: '{}' } }, // necessary so it's not installed in the first package.json directory
}))

it('installs packages already present in package.json with npm', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({
			handler: async() => await installPackages(),
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
						debug: '4.3.3',
					},
				},
			},
		})
	},
	targetStructure: {
		'package.json': { type: 'file', json: { dependencies: { debug: '4.3.3' } } },
	},
}))

it('installs packages already present in composer.json', async() => await usingSandbox({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({
			handler: async() => await installPackages({
				for: 'php',
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
	targetStructure: {
		'composer.json': {
			type: 'file',
			json: { require: { 'innocenzi/laravel-vite': '^0.1.20' } },
		},
	},
}))
