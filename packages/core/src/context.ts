import { randomUUID } from 'node:crypto'
import { performance } from 'node:perf_hooks'
import cac from 'cac'
import simpleGit from 'simple-git'
import type { LastArrayElement } from 'type-fest'
import type { Preset, PresetContext, ActionContext, ApplyOptions, Status, LocalPreset, ActionOptions } from './types'
import { debug } from './utils'

/**
 * Context list, in order of execution.
 */
const contexts: PresetContext[] = []

/**
  * Creates the context for the given preset.
  */
export async function createPresetContext(preset: Preset, applyOptions: ApplyOptions, localPreset: LocalPreset): Promise<PresetContext> {
	debug.context(`Creating a new context for "${preset.name}".`)

	const context: PresetContext = {
		...cac().parse(['', '', ...applyOptions.args]),
		id: randomUUID(),
		name: preset.name,
		git: {
			instance: simpleGit(process.cwd()),
			config: (await simpleGit().listConfig()).all,
		},
		count: contexts.length,
		start: performance.now(),
		end: 0,
		actions: [],
		status: 'applying',
		applyOptions,
		localPreset,
	}

	debug.context('Adding preset context to the stack:', context)
	contexts.push(context)

	return context
}

/**
 * Adds an action to the context.
 */
export function createActionContext<Options extends Object, ResolvedOptions extends ActionOptions<Options>>(
	presetContext: PresetContext,
	name: string,
	options: ResolvedOptions,
) {
	const context: ActionContext<ResolvedOptions> = {
		name,
		options,
		id: randomUUID(),
		presetContextId: presetContext.id,
		start: performance.now(),
		end: 0,
		status: 'applying',
		title: options.title,
		log: [],
	}

	debug.context(`Adding action context to ${presetContext.id}:`, context)
	presetContext.actions.push(context)

	return context
}

/**
 * Gets the context for the current preset.
 */
export function getCurrentPresetContext(): PresetContext | undefined {
	debug.context(`Retrieving the current context from the stack (count: ${contexts.length}).`)

	const context = contexts.at(-1)

	if (!context) {
		debug.context('Context could not be found in the context stack. This might cause issues.')
	}

	debug.context('Current context:', context)

	return context
}

/**
 * Marks the context as finished.
 */
export function finishPresetContext(context: PresetContext, status: Status, error?: Error) {
	context.status = status
	context.end = performance.now()

	if (error) {
		context.error = error
	}
}

/**
 * Mark action as finished.
 */
export function finishActionContext(action: LastArrayElement<PresetContext['actions']>, status: Status, error?: Error) {
	action.status = status
	action.end = performance.now()

	if (error) {
		action.error = error
	}
}

/**
  * Removes the current context from the context stacks.
  */
export function popCurrentContext(): void {
	debug.context('Destroying the current context.')

	if (!contexts.pop()) {
		debug.context('No context found to destroy')
	}
}
