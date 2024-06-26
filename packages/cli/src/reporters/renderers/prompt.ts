import type { ActionContext, PresetContext } from '@preset/core'
import renderTextPrompt, { type TextInput } from './text-prompt'
import renderSelectPrompt, { type SelectInput } from './select-prompt'

export default function renderPrompt(
	preset: PresetContext,
	action: ActionContext,
	inputs: (TextInput | SelectInput)[],
): string {
	const input = inputs.find((input) => input.actionContextId === action.id)

	if (!input) {
		return ''
	}

	return input.isSelect
		? renderSelectPrompt(preset, action, input as SelectInput)
		: renderTextPrompt(preset, action, input as TextInput)
}
