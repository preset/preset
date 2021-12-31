import path from 'path'
import { it, assert } from 'vitest'
import { resolvePreset } from '../src/resolve'

it.skip('resolves file presets', async() => {
	const resolveMap = [
		['./tests/fixtures/basic-preset.ts', path.resolve(__dirname, './fixtures/basic-preset.ts')],
		['./tests/fixtures/preset-with-root-file', path.resolve(__dirname, './fixtures/preset-with-root-file/preset.ts')],
	]

	for (const [input, output] of resolveMap) {
		assert.equal(await resolvePreset(input), output)
	}
})
