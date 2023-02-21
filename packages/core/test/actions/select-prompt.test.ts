import { it, expect } from 'vitest'
import { makeTestPreset } from '../utils'
import { prompt, emitter } from '../../src'

it('emits select and response events and adds response to context', async() => {
	const result: any = {}
	const { context, executePreset } = await makeTestPreset({
		handler: async() => await prompt({
			name: 'choice',
			text: 'Which do you choose?',
			choices: ['first', 'second'],
		}),
	}, {
		parsedOptions: { interaction: true },
	})

	// Handles the response
	emitter.on('prompt:response', (response) =>
		result.response = response
	)

	// Handles the select
	emitter.on('prompt:select', (select) => {
		result.select= select

		// Emits a response
		emitter.emit('prompt:response', { id: select.id, response: 'Makise' })
	})

	expect(await executePreset()).toBe(true)
	expect(context.prompts).toMatchObject({ choice: 'Makise' })
	expect(result).toMatchObject({
		select: {
			id: result.response.id,
			isSelect: true,
			name: 'choice',
			text: 'Which do you choose?',
		},
		response: {
			id: result.select.id,
			response: 'Makise',
		},
	})
})

it('adds a default response to context when no response is emitted', async() => {
	const result: any = {}
	const { context, executePreset } = await makeTestPreset({
		handler: async() => await prompt({
			name: 'choice',
			text: 'Which do you choose?',
			choices: ['first', 'second'],
			initial: 1,
		}),
	}, {
		parsedOptions: { interaction: true },
	})

	// Handles the response
	emitter.on('prompt:response', (response) =>
		result.response = response
	)

	// Handles the select
	emitter.on('prompt:select', (select) => {
		result.select = select

		// Emits a response
		emitter.emit('prompt:response', { id: select.id, response: '' })
	})

	expect(await executePreset()).toBe(true)
	expect(context.prompts).toMatchObject({ choice: 'second' })
	expect(result).toMatchObject({
		select: {
			id: result.response.id,
			isSelect: true,
			name: 'choice',
			text: 'Which do you choose?',
			initial: 1,
		},
		response: {
			id: result.select.id,
			response: '',
		},
	})
})

it('does not emit events when there are no interactions', async() => {
	const result: any = {}
	const { context, executePreset } = await makeTestPreset({
		handler: async() => await prompt({
			name: 'choice',
			text: 'Which do you choose?',
			choices: ['first', 'second'],
		}),
	}, {
		parsedOptions: { interaction: false },
	})

	// Handles the response
	emitter.on('action:start', (context) => result.context = context)

	expect(await executePreset()).toBe(true)
	expect(context.prompts).toMatchObject({ choice: 'first' })
	expect(result.context).toMatchObject({
		options: {
			choices: ['first', 'second'],
			name: 'choice',
			text: 'Which do you choose?'
		},
	})
})
