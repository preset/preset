import createEvents from 'mitt'
import type { PresetContext, ActionContext } from './types'

export const emitter = createEvents<{
	// Presets
	'preset:start': PresetContext
	'preset:end': PresetContext
	'preset:success': PresetContext
	'preset:fail': PresetContext

	// Actions
	'action:start': ActionContext
	'action:end': ActionContext
	'action:success': ActionContext
	'action:fail': ActionContext
}>()
