import type { ActionContext, PresetContext, PromptChoice, PromptSelect } from '@preset/core'
import c from 'chalk'

import { symbols } from './symbols'
import { format } from './text-formater'

export interface SelectInput extends PromptSelect {
	response: string
	cursor: number
	isDone: boolean
}

function getChoicePrefix(preset: PresetContext, idx: number, cursor: number): string {
	return format.indent(preset.count + 2) + (cursor === idx ? `${symbols.pointerDouble}` : ' ')
}

function renderChoices(preset: PresetContext, input: SelectInput) {
	let outputText = '\n'

	for (let i = 0; i < input.choices.length; i++) {
		const choice = input.choices[i] as PromptChoice
		const choiceTitle = typeof choice === 'string' ? choice : choice.title

		const title = input.cursor === i ? c.cyan.underline(choiceTitle) : choiceTitle
		const prefix = getChoicePrefix(preset, i, input.cursor)

		outputText += `${prefix} ${title}\n`
	}

	return outputText
}

export default function renderSelectPrompt(preset: PresetContext, action: ActionContext, input: SelectInput) {
	const isDone = input.isDone
	const hasHint = Boolean(action.options.text)

	const outputTexts = [
		isDone ? symbols.pointerSmall : hasHint ? c.bold.gray(symbols.pointerSmall) : null,
		isDone ? input.response.trim() : hasHint ? c.bold.gray(action.options.text) : null,
	].filter((t) => t)
	const outputText = outputTexts.join(' ')

	return `${outputTexts.length ? ' ' : ''}${isDone ? outputText : outputText + renderChoices(preset, input)}`
}
