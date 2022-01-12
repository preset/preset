import { defineAction } from '../api'
import { applyPreset } from '../apply'
import { debug } from '../utils'
import type { ApplyOptions } from '../types'

export interface ApplyNestedPresetOptions {
	/**
	 * The preset resolvable that will be used.
	 * For instance, `acme/laravel-preset` will use the `laravel-preset` repository of the `acme` GitHub organization.
	 */
	preset: string

	/**
	 * Arguments to give to the preset, like they would be used in the command line, except each argument is an array item.
	 */
	args?: string[]

	/**
	 * Whether to inherit arguments that were given to the current preset.
	 */
	inheritsArguments?: boolean
}

/**
 * Applies another preset. It makes presets composable and reusable.
 */
export const applyNestedPreset = defineAction<ApplyNestedPresetOptions>('apply-nested-preset', async({ options, presetContext, name }) => {
	const otherPresetOptions: ApplyOptions = {
		resolvable: options.preset,
		targetDirectory: presetContext.applyOptions.targetDirectory,
		commandLine: options.inheritsArguments ? presetContext.applyOptions.commandLine : {},
		args: [
			...(options.inheritsArguments ? presetContext.applyOptions.args : []),
			...options.args ?? [],
		],
		actionContextId: presetContext.actions.at(-1)?.id,
	}

	debug.action(name, 'Applying a nested preset:', options.preset, otherPresetOptions)

	return await applyPreset(otherPresetOptions)
})
