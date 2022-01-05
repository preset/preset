import path from 'pathe'
import { it, expect } from 'vitest'
import { parseResolvable, resolvePresetFile } from '../src/resolve'
import type { ResolvedPreset } from '../src/types'

async function ensureParses(map: Array<[string, ResolvedPreset | false]>) {
	for (const [input, output] of map) {
		if (output === false) {
			await expect(async() => await parseResolvable(input)).rejects.toThrow()
		} else {
			expect(await parseResolvable(input)).toMatchObject(output)
		}
	}
}

it('parses local file presets', async() => {
	ensureParses([
		['./test/fixtures/basic-preset.ts', { path: path.resolve(__dirname, './fixtures/basic-preset.ts'), type: 'file' }],
		['./test/fixtures/preset-that-does-not-exist.ts', false],
	])
})

it('parses directory presets', async() => {
	ensureParses([
		['./test/fixtures/preset-with-root-file', { path: path.resolve(__dirname, './fixtures/preset-with-root-file'), type: 'directory' }],
		['./test/fixtures/dir-that-does-not-exists', false],
	])
})

it('parses repository presets', async() => {
	ensureParses([
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
	ensureParses([
		['laravel:inertia', { organization: 'laravel-presets', repository: 'inertia', ssh: true, type: 'repository', tag: undefined }],
	])
})

it('resolves preset files in a directory', async() => {
	const map = [
		['./test/fixtures/preset-with-root-file', path.resolve(__dirname, './fixtures/preset-with-root-file/preset.ts')],
		['./test/fixtures/preset-with-preset-in-pkg', path.resolve(__dirname, './fixtures/preset-with-preset-in-pkg/my-preset.ts')],
	]

	for (const [input, output] of map) {
		expect(await resolvePresetFile(input)).toBe(output)
	}
})
