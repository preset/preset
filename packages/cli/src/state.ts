import { performance } from 'node:perf_hooks'
import { PresetContext } from '@preset/core'
import type { PresetState, State } from './types'

export const state: State = {
	presets: [],
	start: performance.now(),
	end: 0,
}

export function registerPresetContext(context: PresetContext) {
	state.presets.push({
		id: context.id,
		state: 'applying',
		start: performance.now(),
		end: 0,
		actions: {
			failed: 0,
			succeeded: 0,
		},
		context,
	})
}

export function markPresetFinished(context: PresetContext, presetState: PresetState) {
	const preset = getPresetState(context)
	preset.end = performance.now()
	preset.state = presetState

	if (context.count === 0) {
		state.end = performance.now()
	}
}

export function getPresetState(context: PresetContext) {
	for (const preset of state.presets) {
		if (preset.id === context.id) {
			return preset
		}
	}

	throw new EvalError(`Context of ${context.name} is not registered.`)
}
