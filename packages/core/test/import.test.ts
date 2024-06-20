import path from 'node:path'
import { assert, expect, it } from 'vitest'
import { importPresetFile } from '../src/import'
import { emitter } from '../src/events'
import { createTestPresetContext } from './utils'

async function testImport(presetFixturePath: string, expect: any) {
	const presetPath = path.resolve(__dirname, presetFixturePath)
	const preset = await importPresetFile(presetPath)

	assert.equal(JSON.stringify(preset), JSON.stringify(expect))

	return preset
}

it('imports typescript presets', async () => {
	testImport('./fixtures/basic-preset.ts', {
		name: 'basic-preset',
		options: {
			install: true,
			git: true,
		},
		apply: async () => {},
	})
})

it('imports presets that import local files', async () => {
	testImport('./fixtures/preset-that-imports-files/preset.ts', {
		name: 'preset-that-imports-files',
		options: {
			install: true,
			git: true,
		},
		apply: async () => {},
	})
})

it('imports presets with node imports', async () => {
	const action: any = {}
	const preset = await testImport('./fixtures/preset-with-node-import/preset.ts', {
		name: 'preset-with-node-import',
		options: {},
		apply: async () => {},
	})

	emitter.on('action:start', (context) => action.context = context)

	const context = await createTestPresetContext(preset)
	const result = await preset.apply(context)

	expect(result).toBe(true)
	expect(action.context?.title).toBeDefined()
})
