import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { defineAction, emitter } from '../src'

test('an action emits a fail event', async() => {
	const result = { names: [] as string[], errors: [] as string[] }
	const failingAction = defineAction('failing-action', () => false)
	const throwingAction = defineAction('throwing-action', () => {
		throw new Error('Action failed with throwing.')
	})

	emitter.on('action:failed', (name, error) => {
		result.names.push(name)
		result.errors.push(error.message)
	})

	await failingAction()
	await throwingAction()

	assert.equal(result.names, [
		'failing-action',
		'throwing-action',
	])

	assert.equal(result.errors, [
		'Action failed without throwing.',
		'Action failed with throwing.',
	])
})

test('an action emits a success event', async() => {
	const result = { name: '' }
	const successfulAction = defineAction('successful-action', () => true)

	emitter.on('action:success', (name) => {
		result.name = name
	})

	await successfulAction()

	assert.equal(result.name, 'successful-action')
})

test('all actions emit an end event', async() => {
	const result = { names: [] as string[] }
	const successfulAction = defineAction('successful-action', () => true)
	const failingAction = defineAction('failing-action', () => false)
	const throwingAction = defineAction('throwing-action', () => {
		throw new Error('throw')
	})

	emitter.on('action:end', (name) => {
		result.names.push(name)
	})

	await successfulAction()
	await failingAction()
	await throwingAction()

	assert.equal(result.names, [
		'successful-action',
		'failing-action',
		'throwing-action',
	])
})

test.run()
