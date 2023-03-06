import { ActionContext, PresetContext, PromptInput } from '@preset/core'
import c from 'chalk'

import { symbols } from './symbols'
import { format } from './text-formater'

export interface TextInput extends PromptInput {
	response: string
}

export default function renderTextPrompt(preset: PresetContext, action: ActionContext, input: TextInput): string {
	let text = '\n'
	text += format.indent(preset.count + 1)
	text += `${format.dim(`${symbols.subArrow} ${action.options.text}`)} `
	text += c.gray.bold(input?.response.trim() || action.options.default)
	return text
}
