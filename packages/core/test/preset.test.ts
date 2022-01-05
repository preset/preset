import { it, assert, expect } from 'vitest'
import { defineAction, emitter } from '../src'
import { makeTestPreset } from './utils'

const successfulAction = defineAction('successful-action', () => true)
const failingAction = defineAction('failing-action', () => false)

it('runs a preset and its actions', async() => {
	const result = { name: '', successful: false, successfulActions: 0 }
	const { preset, context } = await makeTestPreset({
		handler: async() => {
			await successfulAction()
			await successfulAction()
		},
	})

	emitter.on('preset:start', ({ name }) => result.name = name)
	emitter.on('action:success', () => result.successfulActions += 1)
	emitter.on('preset:success', () => result.successful = true)

	await preset.apply(context)

	assert.equal(result.name, 'test-preset')
	assert.equal(result.successful, true)
	assert.equal(result.successfulActions, 2)
})

it('runs a preset and its actions and fails at the end', async() => {
	const result = { name: '', successful: false, successfulActions: 0, failedActions: 0, ended: false }
	const { preset, context } = await makeTestPreset({
		handler: async() => {
			await successfulAction()
			await failingAction()
			await successfulAction()
		},
	})

	emitter.on('preset:start', ({ name }) => result.name = name)
	emitter.on('action:success', () => result.successfulActions += 1)
	emitter.on('action:fail', () => result.failedActions += 1)
	emitter.on('preset:success', () => result.successful = true)
	emitter.on('preset:end', () => result.ended = true)

	await preset.apply(context)

	expect(result).toMatchObject({
		name: 'test-preset',
		successful: false,
		ended: true,
		successfulActions: 2,
		failedActions: 1,
	})
})

it('runs actions with parameters and default parameters', async() => {
	const result: any = { name: '', actionFlag: '', actionDefaultFlag: '', successful: false }
	const parameterizedAction = defineAction<{ flag: string }>('parameterized-action', ({ options }) => {
		result.actionFlag = options.flag

		return true
	})

	const parameterizedActionWithDefault = defineAction<{ flag?: string }>('parameterized-action-with-default', ({ options }) => {
		result.actionDefaultFlag = options.flag

		return true
	}, {
		flag: 'default-flag',
	})

	const { preset, context } = await makeTestPreset({
		handler: async() => {
			await successfulAction()
			await parameterizedAction({ flag: 'flagged' })
			await parameterizedActionWithDefault({})
		},
	})

	emitter.on('preset:start', ({ name }) => result.name = name)
	emitter.on('preset:success', () => result.successful = true)

	await preset.apply(context)

	assert.equal(result.name, 'test-preset')
	assert.equal(result.actionFlag, 'flagged')
	assert.equal(result.actionDefaultFlag, 'default-flag')
	assert.equal(result.successful, true)
})
