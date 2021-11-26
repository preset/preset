import { createNanoEvents } from 'nanoevents'

export const emitter = createNanoEvents<{
	// Presets
	'preset:start': (name: string) => void
	'preset:end': (name: string) => void
	'preset:success': (name: string) => void
	'preset:failed': (name: string, error: Error) => void

	// Actions
	'action:start': (name: string) => void
	'action:end': (name: string) => void
	'action:success': (name: string) => void
	'action:failed': (name: string, error: Error) => void
}>()
