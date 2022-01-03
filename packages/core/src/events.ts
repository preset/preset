import { createNanoEvents } from 'nanoevents'
import type { PresetContext } from './types'

export const emitter = createNanoEvents<{
	// Presets
	'preset:start': (context: PresetContext) => void
	'preset:end': (context: PresetContext) => void
	'preset:success': (context: PresetContext) => void
	'preset:failed': (context: PresetContext, error: Error) => void

	// Actions
	'action:start': (context: PresetContext) => void
	'action:end': (context: PresetContext) => void
	'action:success': (context: PresetContext) => void
	'action:failed': (context: PresetContext, error: Error) => void
}>()
