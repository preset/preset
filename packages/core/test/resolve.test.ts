import path from 'node:path'
import { it, expect } from 'vitest'
import { parseResolvable, resolvePresetFile } from '../src/resolve'
import type { ResolvedPreset } from '../src/types'
import { presetFixture } from './utils'

async function ensureParses(map: Array<[string, ResolvedPreset | false]>) {
	const cwd = path.resolve(__dirname, '..')

	for (const [input, output] of map) {
		if (output === false) {
			await expect(async() => await parseResolvable(input, cwd)).rejects.toThrow()
		} else {
			expect(await parseResolvable(input, cwd)).toMatchObject(output)
		}
	}
}

it('parses local file presets', async() => {
	await ensureParses([
		[presetFixture('basic-preset.ts'), { path: presetFixture('basic-preset.ts'), type: 'file' }],
		['../core/test/fixtures/basic-preset.ts', { path: presetFixture('basic-preset.ts'), type: 'file' }],
		['./test/fixtures/basic-preset.ts', { path: presetFixture('basic-preset.ts'), type: 'file' }],
		['./test/fixtures/preset-that-does-not-exist.ts', false],
	])
})

it('parses directory presets', async() => {
	await ensureParses([
		[presetFixture('preset-with-root-file'), { path: presetFixture('preset-with-root-file'), type: 'directory' }],
		['./test/fixtures/preset-with-root-file', { path: presetFixture('preset-with-root-file'), type: 'directory' }],
		['./test/fixtures/dir-that-does-not-exists', false],
	])
})

it('parses repository presets', async() => {
	await ensureParses([
		['preset/cli', { organization: 'preset', repository: 'cli', ssh: true, type: 'repository', tag: undefined }],
		['preset/cli@v0.1', { organization: 'preset', repository: 'cli', ssh: true, type: 'repository', tag: 'v0.1' }],
		['preset/cli@main', { organization: 'preset', repository: 'cli', ssh: true, type: 'repository', tag: 'main' }],
		['https://github.com/preset/cli', { organization: 'preset', repository: 'cli', ssh: false, type: 'repository', tag: undefined }],
		['https://github.com/preset/cli@v0.1', { organization: 'preset', repository: 'cli', ssh: false, type: 'repository', tag: 'v0.1' }],
		['git@github.com:preset/cli.git', { organization: 'preset', repository: 'cli', ssh: true, type: 'repository', tag: undefined }],
		['git@github.com:preset/cli.git@v0.1', { organization: 'preset', repository: 'cli', ssh: true, type: 'repository', tag: 'v0.1' }],
	])
})

it('parses namespaced preset aliases', async() => {
	await ensureParses([
		['laravel:inertia', { organization: 'laravel-presets', repository: 'inertia', ssh: true, type: 'repository', tag: undefined }],
	])
})

it('resolves preset files in a directory', async() => {
	const map = [
		[presetFixture('preset-with-root-file'), presetFixture('preset-with-root-file/preset.ts')],
		['./test/fixtures/preset-with-root-file', presetFixture('preset-with-root-file/preset.ts')],
		['./test/fixtures/preset-with-preset-in-pkg', presetFixture('preset-with-preset-in-pkg/my-preset.ts')],
	]

	for (const [input, output] of map) {
		expect(await resolvePresetFile(input, path.resolve(__dirname, '..'))).toBe(output)
	}
})
