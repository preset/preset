import path from 'path'
import { it, assert } from 'vitest'
import { importPresetFile } from '../src/import'

it('imports typescript presets', async() => {
	const presetPath = path.resolve(__dirname, './fixtures/basic-preset.ts')
	const preset = await importPresetFile(presetPath)

	assert.equal(JSON.stringify(preset), JSON.stringify({
		name: 'basic-preset',
		flags: {
			install: true,
			git: true,
		},
		apply: async() => {},
	}))
})
