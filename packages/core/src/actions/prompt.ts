import { randomUUID } from 'node:crypto'
import { defineAction } from '../api'
import { debug } from '../utils'
import { emitter } from '../events'

/**
 * Asks for information.
 */
export const prompt = defineAction<PromptOptions>('prompt', async({ presetContext, actionContext, options }) => {
	const promptId = randomUUID()

	debug.action(actionContext.name, `Prompting for "${options.name}":`, options.text)
	debug.action(actionContext.name, 'Default response:', options.default ?? 'not defined')
	debug.action(actionContext.name, 'Prompt ID', promptId)

	// Sets default
	presetContext.prompts[options.name] = options.default

	// Don't emit if no interaction were asked
	if (presetContext.options.interaction === false || presetContext.applyOptions.parsedOptions.interaction !== true) {
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
			...options,
		})
	})
})

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
