import { it, expect } from 'vitest'
import { makeTestPreset } from '../utils'
import { prompt, emitter } from '../../src'

it('emits input and response events and adds response to context', async() => {
	const result: any = {}
	const { context, executePreset } = await makeTestPreset({
		handler: async() => await prompt({
			name: 'name',
			text: 'What is your name?',
		}),
	}, {
		parsedOptions: { interaction: true },
	})

	// Handles the response
	emitter.on('prompt:response', (response) => result.response = response)

	// Handles the input
	emitter.on('prompt:input', (input) => {
		result.input = input

		// Emits a response
		emitter.emit('prompt:response', { id: input.id, response: 'Makise' })
	})

	expect(await executePreset()).toBe(true)
	expect(context.prompts).toMatchObject({ name: 'Makise' })
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

it('adds a default response to context when no resposne is emitted', async() => {
	const result: any = {}
	const { context, executePreset } = await makeTestPreset({
		handler: async() => await prompt({
			name: 'name',
			text: 'What is your name?',
			default: 'Okabe',
		}),
	}, {
		parsedOptions: { interaction: true },
	})

	// Handles the response
	emitter.on('prompt:response', (response) => result.response = response)

	// Handles the input
	emitter.on('prompt:input', (input) => {
		result.input = input

		// Emits a response
		emitter.emit('prompt:response', { id: input.id, response: '' })
	})

	expect(await executePreset()).toBe(true)
	expect(context.prompts).toMatchObject({ name: 'Okabe' })
	expect(result).toMatchObject({
		input: {
			id: result.response.id,
			name: 'name',
			text: 'What is your name?',
			default: 'Okabe',
		},
		response: {
			id: result.input.id,
			response: '',
		},
	})
})

it('does not emit events when there are no interactions', async() => {
	const result: any = {}
	const { context, executePreset } = await makeTestPreset({
		handler: async() => await prompt({
			name: 'name',
			text: 'What is your name?',
			default: 'Makise',
		}),
	}, {
		parsedOptions: { interaction: false },
	})

	// Handles the response
	emitter.on('action:start', (context) => result.context = context)

	expect(await executePreset()).toBe(true)
	expect(context.prompts).toMatchObject({ name: 'Makise' })
	expect(result.context).toMatchObject({
		options: {
			name: 'name',
			text: 'What is your name?',
			default: 'Makise',
		},
	})
})
