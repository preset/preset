import path from 'path'
import { it, assert } from 'vitest'
import { importPresetFile } from '../src/import'

async function testImport(presetFixturePath: string, expect: any) {
	const presetPath = path.resolve(__dirname, presetFixturePath)
	const preset = await importPresetFile(presetPath)

	assert.equal(JSON.stringify(preset), JSON.stringify(expect))
}

it('imports typescript presets', async() => {
	testImport('./fixtures/basic-preset.ts', {
		name: 'basic-preset',
		flags: {
			install: true,
			git: true,
		},
		apply: async() => {},
	})
})

it('imports presets that import local files', async() => {
	testImport('./fixtures/preset-that-imports-files/preset.ts', {
		name: 'preset-that-imports-files',
		flags: {
			install: true,
			git: true,
		},
		apply: async() => {},
	})
})
