import { createNanoEvents } from 'nanoevents'
import type { PresetContext, ActionContext } from './types'

export const emitter = createNanoEvents<{
	// Presets
	'preset:start': (context: PresetContext) => void
	'preset:end': (context: PresetContext) => void
	'preset:success': (context: PresetContext) => void
	'preset:fail': (context: PresetContext, error: Error) => void

	// Actions
	'action:start': (context: ActionContext) => void
	'action:end': (context: ActionContext) => void
	'action:success': (context: ActionContext) => void
	'action:fail': (context: ActionContext, error: Error) => void
}>()
