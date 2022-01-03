import type { PresetContext } from '@preset/core'

export type PresetState = 'applying' | 'failed' | 'applied'
export interface RunningPreset {
	id: string
	context: PresetContext
	state: PresetState
	start: number
	end: number
	actions: {
		failed: number
		succeeded: number
	}
}

export interface State {
	presets: RunningPreset[]
	start: number
	end: number
}

export interface Renderer {
	name: string
	registerEvents: () => void
}

export function makeRenderer(renderer: Renderer) {
	return renderer
}
