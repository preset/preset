import path from 'path'
import { test } from 'uvu'
import { resolvePreset } from '../src/resolve'

test('a file preset can be resolved', async() => {
	const presetPath = path.resolve(__dirname, './fixtures/basic-preset.ts')
	await resolvePreset(presetPath)
	await resolvePreset(process.cwd())
	await resolvePreset('./src')
})

test.run()
