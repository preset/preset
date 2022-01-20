import path from 'node:path'
import { it, expect } from 'vitest'
import { parseResolvable, resolvePresetFile } from '../src/resolve'
import type { ResolvedPreset, ApplyOptions } from '../src/types'
import { presetFixture, fixedFixturesDirectory } from './utils'

async function ensureParses(map: Array<[string, ResolvedPreset | false]>) {
	const cwd = path.resolve(__dirname, '..')

	for (const [input, output] of map) {
		const options: ApplyOptions = {
			resolvable: input,
			parsedOptions: {},
			targetDirectory: '',
			rawArguments: [],
		}

		if (output === false) {
			await expect(async() => await parseResolvable(options, cwd)).rejects.toThrow()
		} else {
			expect(await parseResolvable(options, cwd)).toMatchObject(output)
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
		['preset/cli', { organization: 'preset', repository: 'cli', ssh: true, type: 'repository', tag: undefined, path: '' }],
		['preset/cli@v0.1', { organization: 'preset', repository: 'cli', ssh: true, type: 'repository', tag: 'v0.1', path: '' }],
		['preset/cli@main', { organization: 'preset', repository: 'cli', ssh: true, type: 'repository', tag: 'main', path: '' }],
		['https://github.com/preset/cli', { organization: 'preset', repository: 'cli', ssh: false, type: 'repository', tag: undefined, path: '' }],
		['https://github.com/preset/cli@v0.1', { organization: 'preset', repository: 'cli', ssh: false, type: 'repository', tag: 'v0.1', path: '' }],
		['git@github.com:preset/cli.git', { organization: 'preset', repository: 'cli', ssh: true, type: 'repository', tag: undefined, path: '' }],
		['git@github.com:preset/cli.git@v0.1', { organization: 'preset', repository: 'cli', ssh: true, type: 'repository', tag: 'v0.1', path: '' }],
	])
})

it('parses namespaced preset aliases', async() => {
	await ensureParses([
		['laravel:inertia', { organization: 'laravel-presets', repository: 'inertia', ssh: true, type: 'repository', tag: undefined, path: '' }],
	])
})

it('resolves preset files in a directory', async() => {
	const map = [
		[presetFixture('preset-with-root-file'), presetFixture('preset-with-root-file/preset.ts')],
		['./test/fixtures/preset-with-root-file', presetFixture('preset-with-root-file/preset.ts')],
		['./test/fixtures/preset-with-preset-in-pkg', presetFixture('preset-with-preset-in-pkg/my-preset.ts')],
	]

	for (const [input, output] of map) {
		expect(await resolvePresetFile(input, path.resolve(__dirname, '..'))).toMatchObject({
			presetFile: output,
		})
	}
})

it('resolves preset files in a directory', async() => {
	const cwd = path.resolve(__dirname, '..')
	const map = [
		['preset-with-root-file', presetFixture('preset-with-root-file/preset.ts')],
		['preset-with-preset-in-pkg', presetFixture('preset-with-preset-in-pkg/my-preset.ts')],
	]

	for (const [path, output] of map) {
		const options: ApplyOptions = {
			resolvable: fixedFixturesDirectory, // directiry
			parsedOptions: { path }, // custom path
			targetDirectory: '',
			rawArguments: [],
		}

		const resolved = await parseResolvable(options, cwd)
		const preset = await resolvePresetFile(resolved.path)

		expect(resolved).toMatchObject({ path: presetFixture(path), type: 'directory' })
		expect(preset).toMatchObject({ rootDirectory: resolved.path, presetFile: output })
	}
})

it('finds versions of a resolved preset', async() => {
	const cwd = path.resolve(__dirname, '..')
	const map = [
		['preset-with-specific-version', presetFixture('preset-with-specific-version/preset.ts'), '^0.1.0'],
	]

	for (const [path, output, version] of map) {
		const options: ApplyOptions = {
			resolvable: fixedFixturesDirectory, // directiry
			parsedOptions: { path }, // custom path
			targetDirectory: '',
			rawArguments: [],
		}

		const resolved = await parseResolvable(options, cwd)
		const preset = await resolvePresetFile(resolved.path)

		expect(resolved).toMatchObject({ path: presetFixture(path), type: 'directory' })
		expect(preset).toMatchObject({ rootDirectory: resolved.path, presetFile: output, presetVersion: version })
	}
})
