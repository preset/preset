import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { PresetHandler, defineAction, definePreset, emitter } from '../src'

const successfulAction = defineAction('successful-action', () => true)
const failingAction = defineAction('failing-action', () => false)
const makeTestPreset = (handler: PresetHandler) => definePreset({
	name: 'test-preset',
	flags: {
		auth: true,
	},
	handler,
})

test('it runs a preset and its actions', async() => {
	const result = { name: '', successful: false, successfulActions: 0 }
	const preset = makeTestPreset(async() => {
		await successfulAction()
		await successfulAction()
	})

	emitter.on('preset:start', (name) => result.name = name)
	emitter.on('action:success', () => result.successfulActions += 1)
	emitter.on('preset:success', () => result.successful = true)

	await preset.apply()

	assert.is(result.name, 'test-preset')
	assert.is(result.successful, true)
	assert.is(result.successfulActions, 2)
})

test('it runs a preset and its actions and fails gracefully', async() => {
	const result = { name: '', successful: false, successfulActions: 0, failedActions: 0 }
	const preset = makeTestPreset(async() => {
		await successfulAction()
		await failingAction()
		await successfulAction()
	})

	emitter.on('preset:start', (name) => result.name = name)
	emitter.on('action:success', () => result.successfulActions += 1)
	emitter.on('action:failed', () => result.failedActions += 1)
	emitter.on('preset:success', () => result.successful = true)

	await preset.apply()

	assert.is(result.name, 'test-preset')
	assert.is(result.successful, false)
	assert.is(result.successfulActions, 2)
	assert.is(result.failedActions, 1)
})

test('it runs actions with parameters', async() => {
	const result = { name: '', actionFlag: '', successful: false }
	const parameterizedAction = defineAction<{ flag: string }>('parameterized-action', ({ options }) => {
		result.actionFlag = options.flag

		return true
	})

	const preset = makeTestPreset(async() => {
		await successfulAction()
		await parameterizedAction({ flag: 'flagged' })
	})

	emitter.on('preset:start', (name) => result.name = name)
	emitter.on('preset:success', () => result.successful = true)

	await preset.apply()

	assert.is(result.name, 'test-preset')
	assert.is(result.actionFlag, 'flagged')
	assert.is(result.successful, true)
})

test.run()
