import { createNanoEvents } from 'nanoevents'
import type { PresetContext } from './types'

export const emitter = createNanoEvents<{
	// Presets
	'preset:start': (context: PresetContext) => void
	'preset:end': (context: PresetContext) => void
	'preset:success': (context: PresetContext) => void
	'preset:fail': (context: PresetContext, error: Error) => void

	// Actions
	'action:start': (name: string, context: PresetContext) => void
	'action:end': (name: string, context: PresetContext) => void
	'action:success': (name: string, context: PresetContext) => void
	'action:fail': (name: string, context: PresetContext, error: Error) => void
}>()
