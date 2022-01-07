import { defineAction } from '../api'
import { applyPreset } from '../apply'
import { debug } from '../utils'
import type { ApplyOptions } from '../types'

export interface ApplyNestedPresetOptions {
	resolvable: string
	args?: string[]
	inheritsArguments?: boolean
}

export const applyNestedPreset = defineAction<ApplyNestedPresetOptions>('apply-nested-preset', async({ options, presetContext, name }) => {
	const otherPresetOptions: ApplyOptions = {
		resolvable: options.resolvable,
		targetDirectory: presetContext.applyOptions.targetDirectory,
		commandLine: options.inheritsArguments ? presetContext.applyOptions.commandLine : {},
		args: [
			...(options.inheritsArguments ? presetContext.applyOptions.args : []),
			...options.args ?? [],
		],
		actionContextId: presetContext.actions.at(-1)?.id,
	}

	debug.action(name, 'Applying a nested preset:', options.resolvable, otherPresetOptions)

	return await applyPreset(otherPresetOptions)
})
