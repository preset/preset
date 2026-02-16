import { expect, it } from 'vitest'
import { applyNestedPreset, emitter, type PresetContext } from '../../src'
import { presetFixture, usingSandbox } from '../utils'

it('applies the given nested preset', async () =>
	await usingSandbox({
		fn: async (_, makeTestPreset) => {
			const result: any = {}
			const { executePreset } = await makeTestPreset({
				handler: async () =>
					await applyNestedPreset({
						preset: presetFixture('basic-preset.ts'),
					}),
			})

			emitter.on('preset:start', (context) => result.context = context)

			await executePreset()

			expect(result.context.name).toBe('basic-preset')
		},
	}))

it('can be given arguments', async () =>
	await usingSandbox({
		fn: async (_, makeTestPreset) => {
			const result = { context: undefined as PresetContext | undefined }
			const { executePreset } = await makeTestPreset({
				handler: async () =>
					await applyNestedPreset({
						args: ['some-arg', '--some-flag'],
						preset: presetFixture('basic-preset.ts'),
					}),
			})

			emitter.on('preset:start', (context) => result.context = context)

			await executePreset()

			expect(result.context?.name).toBe('basic-preset')
			expect(result.context?.args).toStrictEqual(['some-arg'])
			expect(result.context?.options).toMatchObject({ someFlag: true })
			expect(result.context?.applyOptions.rawArguments).toStrictEqual(['some-arg', '--some-flag'])
		},
	}))

it('can inherit arguments', async () =>
	await usingSandbox({
		fn: async (_, makeTestPreset) => {
			const result = { context: undefined as PresetContext | undefined }
			const { executePreset } = await makeTestPreset({
				handler: async () =>
					await applyNestedPreset({
						inheritsArguments: true,
						preset: presetFixture('basic-preset.ts'),
					}),
			}, {
				rawArguments: ['some-arg', 'some arg with spaces', '--some-flag', '--some-other-flag', 'the flag value'],
			})

			emitter.on('preset:start', (context) => result.context = context)

			await executePreset()

			expect(result.context?.name).toBe('basic-preset')
			expect(result.context?.applyOptions.rawArguments).toStrictEqual([
				'some-arg',
				'some arg with spaces',
				'--some-flag',
				'--some-other-flag',
				'the flag value',
			])
			expect(result.context?.args).toStrictEqual(['some-arg', 'some arg with spaces'])
			expect(result.context?.options).toMatchObject({
				someFlag: true,
				someOtherFlag: 'the flag value',
			})
		},
	}))
