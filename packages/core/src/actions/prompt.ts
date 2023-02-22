import { randomUUID } from 'node:crypto'
import { defineAction } from '../api'
import { debug } from '../utils'
import { emitter } from '../events'
import { ActionContext, PresetContext } from '../types'

function shouldReturnDefaultResponse(presetContext: PresetContext): boolean {
	return presetContext.options.interaction === false
		|| presetContext.applyOptions.parsedOptions.interaction !== true
		|| presetContext.applyOptions.parsedOptions.debug === true
		|| process.stdout.isTTY === false
}

async function inputPromptAction({ presetContext, actionContext, options }: PromptAction): Promise<boolean> {
	const promptId = randomUUID()

	debug.action(actionContext.name, `Prompting text for "${options.name}":`, options.text)
	debug.action(actionContext.name, 'Default response:', options.default ?? 'not defined')
	debug.action(actionContext.name, 'Prompt ID', promptId)

	// Sets default
	presetContext.prompts[options.name] = options.default

	if (shouldReturnDefaultResponse(presetContext)) {
		debug.action(actionContext.name, 'Interactions disabled, using default response.')
		return true
	}

	return await new Promise((resolve) => {
		// Catches the response
		emitter.on('prompt:response', ({ id, response }) => {
			if (id !== promptId) {
				return debug.action(actionContext.name, 'Received response for another prompt.')
			}

			// Sets the prompt response
			presetContext.prompts[options.name] = response?.trim() || options.default
			debug.action(actionContext.name, 'Received response:', presetContext.prompts[options.name])

			resolve(true)
		})

		// Emits the input
		debug.action(actionContext.name, `Emitting input event for "${options.name}".`)
		emitter.emit('prompt:input', {
			actionContextId: actionContext.id,
			id: promptId,
			isSelect: false,
			...options,
		})
	})
}

async function selectPromptAction({ presetContext, actionContext, options }: SelectPromptAction): Promise<boolean> {
	const promptId = randomUUID()

	function getDefault(options: SelectPromptOptions): string {
		const optionIdx = options.initial || 0
		const choice = options.choices[optionIdx] as PromptChoice

		return typeof choice === 'string' ? choice : choice.value || choice.title
	}

	debug.action(actionContext.name, `Prompting selection for "${options.name}":`, options.text)
	debug.action(actionContext.name, 'Default response:', getDefault(options) ?? 'not defined')
	debug.action(actionContext.name, 'Prompt ID', promptId)

	// Sets default
	presetContext.prompts[options.name] = getDefault(options)

	if (shouldReturnDefaultResponse(presetContext)) {
		debug.action(actionContext.name, 'Interactions disabled, using default response.')
		return true
	}

	return await new Promise((resolve) => {
		// Catches the response
		emitter.on('prompt:response', ({ id, response }) => {
			if (id !== promptId) {
				return debug.action(actionContext.name, 'Received response for another prompt.')
			}

			// Sets the prompt response
			presetContext.prompts[options.name] = response?.trim() || getDefault(options)
			debug.action(actionContext.name, 'Received response:', presetContext.prompts[options.name])

			resolve(true)
		})

		// Emits the select
		debug.action(actionContext.name, `Emitting select event for "${options.name}".`)

		emitter.emit('prompt:select', {
			actionContextId: actionContext.id,
			id: promptId,
			isSelect: true,
			...options,
		})
	})
}

/**
 * Asks for information.
 */
export const prompt = defineAction<PromptOptions | SelectPromptOptions>('prompt', async({
	presetContext,
	actionContext,
	options,
}) => {
	const isSelect = Object.keys(options).includes('choices')
	return isSelect
		? selectPromptAction({ presetContext, actionContext, options: options as SelectPromptOptions })
		: inputPromptAction({ presetContext, actionContext, options: options as PromptOptions })
})

export interface PromptAction {
	presetContext: PresetContext
	actionContext: ActionContext
	options: PromptOptions
}

export interface SelectPromptAction extends PromptAction {
	options: SelectPromptOptions
}

export interface PromptOptions {
	/**
	 * The name of the prompt.
	 */
	name: string

	/**
	 * The text to prompt.
	 */
	text: string

	/**
	 * A default answer if none is returned.
	 */
	default?: string
}

export type PromptChoice = { title: string; value?: string } | string

export interface SelectPromptOptions {
	/**
	 * The name of the prompt.
	 */
	name: string

	/**
	 * The text to prompt.
	 */
	text: string

	/**
	 * Initial choice.
	 */
	initial?: number

	/**
	 * List of possible choices.
	 */
	choices: PromptChoice[]
}
