import { test, assert, expect } from 'vitest'
import { defineAction, emitter, resolvePreset } from '../src'
import type { ActionContext } from '../src/types'
import { makeTestPreset, fixedFixturesDirectory } from './utils'

test('an action emits a fail event', async() => {
	const contexts: ActionContext[] = []
	const failingAction = defineAction('failing-action', () => false)
	const throwingAction = defineAction('throwing-action', () => {
		throw new Error('Action failed with throwing.')
	})

	emitter.on('action:fail', (context) => contexts.push(context))

	const { executePreset } = await makeTestPreset({
		handler: async() => {
			await failingAction()
			await throwingAction()
		},
	})

	await executePreset()

	assert.sameOrderedMembers(contexts.map(({ name }) => name), [
		'failing-action',
		'throwing-action',
	])

	assert.sameOrderedMembers(contexts.map(({ error }) => error!.message), [
		'Action failed to execute properly.',
		'Action failed with throwing.',
	])
})

test('an action emits a success event', async() => {
	const actionNames: string[] = []
	const successfulAction = defineAction('successful-action', () => true)

	emitter.on('action:success', (context) => actionNames.push(context.name))

	const { executePreset } = await makeTestPreset({
		handler: async() => {
			await successfulAction()
		},
	})

	await executePreset()

	assert.sameOrderedMembers(actionNames, [
		'successful-action',
	])
})

test('all actions emit an end event', async() => {
	const actionNames: string[] = []
	const successfulAction = defineAction('successful-action', () => true)
	const failingAction = defineAction('failing-action', () => false)
	const throwingAction = defineAction('throwing-action', () => {
		throw new Error('throw')
	})

	emitter.on('action:end', (context) => actionNames.push(context.name))

	const { executePreset } = await makeTestPreset({
		handler: async() => {
			await successfulAction()
			await failingAction()
			await throwingAction()
		},
	})

	await executePreset()

	assert.sameOrderedMembers(actionNames, [
		'successful-action',
		'failing-action',
		'throwing-action',
	])
})

test('applying a preset emits an event', async() => {
	const result: any = {}
	emitter.on('preset:resolve', (resolved) => result.resolved = resolved)

	const resolved = await resolvePreset({
		resolvable: fixedFixturesDirectory,
		targetDirectory: '',
		rawArguments: [],
		parsedOptions: {
			path: 'preset-with-specific-version',
		},
	})

	expect(resolved).toMatchObject(resolved)
})
