import createEvents from 'mitt'
import type { ActionContext, LocalPreset, PresetContext, PromptInput, PromptResponse, PromptSelect } from './types'

export const emitter = createEvents<{
	// Presets
	'preset:resolve': LocalPreset
	'preset:start': PresetContext
	'preset:end': PresetContext
	'preset:success': PresetContext
	'preset:fail': PresetContext

	// Actions
	'action:start': ActionContext
	'action:end': ActionContext
	'action:success': ActionContext
	'action:fail': ActionContext

	// Prompt
	'prompt:input': PromptInput
	'prompt:response': PromptResponse
	'prompt:select': PromptSelect
}>()
