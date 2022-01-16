import { it, expect } from 'vitest'
import { makeTestPreset } from '../utils'
import { prompt, emitter } from '../../src'

it('emits input and response events', async() => {
	const result: any = {}
	const { executePreset } = await makeTestPreset({
		handler: async() => await prompt({
			name: 'name',
			text: 'What is your name?',
		}),
	})

	// Handles the response
	emitter.on('prompt:response', ({ id, response }) => {
		result.response = { id, response }
	})

	// Handles the input
	emitter.on('prompt:input', ({ id, name, text }) => {
		result.input = { id, name, text }

		// Emits a response
		emitter.emit('prompt:response', { id, response: 'Makise' })
	})

	expect(await executePreset()).toBe(true)
	expect(result).toMatchObject({
		input: {
			id: result.response.id,
			name: 'name',
			text: 'What is your name?',
		},
		response: {
			id: result.input.id,
			response: 'Makise',
		},
	})
})
