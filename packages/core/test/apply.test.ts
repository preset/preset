import { expect, it } from 'vitest'
import { applyPreset } from '../src/apply'
import { presetFixture, usingSandbox } from './utils'

it('applies the given preset by file name', async () => usingSandbox({
	fn: async ({ targetDirectory }) => {
		const result = await applyPreset({
			resolvable: presetFixture('basic-preset.ts'),
			parsedOptions: {},
			rawArguments: [],
			targetDirectory,
		})

		expect(result).toBe(true)
	},
}))

it('applies the given preset by directory name', async () => usingSandbox({
	fn: async ({ targetDirectory }) => {
		const result = await applyPreset({
			resolvable: presetFixture('preset-with-root-file'),
			parsedOptions: {},
			rawArguments: [],
			targetDirectory,
		})

		expect(result).toBe(true)
	},
}))
