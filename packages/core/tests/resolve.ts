import path from 'path'
import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { resolvePreset } from '../src/resolve'

test('a file preset can be resolved', async() => {
	const resolveMap = [
		['./tests/fixtures/basic-preset.ts', path.resolve(__dirname, './fixtures/basic-preset.ts')],
		['./tests/fixtures/preset-with-root-file', path.resolve(__dirname, './fixtures/preset-with-root-file/preset.ts')],
	]

	for (const [input, output] of resolveMap) {
		assert.equal(await resolvePreset(input), output)
	}
})

test.run()
