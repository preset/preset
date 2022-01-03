import { defineAction } from '../api'
import { applyPreset } from '../apply'
import { debug } from '../utils'

interface ApplyNestedPresetOptions {
	resolvable: string
	args?: string[]
	inheritsArguments?: boolean
}

export const applyNestedPreset = defineAction<ApplyNestedPresetOptions>('apply-nested-preset', async({ options, context, name }) => {
	const otherPresetOptions = {
		resolvable: options.resolvable,
		targetDirectory: context.applyOptions.targetDirectory,
		commandLine: options.inheritsArguments ? context.applyOptions.args : {},
		args: options.args ?? [],
	}

	debug.action(name, 'Applying a nested preset:', options.resolvable, otherPresetOptions)

	return await applyPreset(otherPresetOptions)
})
