import path from 'path'
import * as assert from 'uvu/assert'
import { test } from 'uvu'
import { importPresetFile } from '../src/import'

test('typescript presets can be imported', async() => {
	const presetPath = path.resolve(__dirname, './fixtures/basic-preset.ts')
	const preset = await importPresetFile(presetPath)

	assert.fixture(JSON.stringify(preset), JSON.stringify({
		name: 'basic-preset',
		flags: {
			install: true,
			git: true,
		},
		apply: async() => {},
	}))
})

test.run()
