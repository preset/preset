import { randomUUID } from 'node:crypto'
import { performance } from 'node:perf_hooks'
import cac from 'cac'
import simpleGit from 'simple-git'
import type { LastArrayElement } from 'type-fest'
import type { ActionContext, ActionOptions, ApplyOptions, LocalPreset, Preset, PresetContext, Status } from './types'
import { debug, objectWithoutKeys } from './utils'
import { PresetError } from './errors'

/**
 * Context list, in order of execution.
 */
const contexts: PresetContext[] = []

/**
 * Creates the context for the given preset.
 * @internal
 */
export async function createPresetContext(preset: Preset, applyOptions: ApplyOptions, localPreset: LocalPreset): Promise<PresetContext> {
	debug.context(`Creating a new context for "${preset.name}".`)

	const { options, args } = cac().parse(['', '', ...applyOptions.rawArguments])

	const context: PresetContext = {
		name: preset.name,
		options: {
			...preset.options,
			...options,
		},
		preset,
		args,
		id: randomUUID(),
		git: {
			instance: simpleGit(),
			config: (await simpleGit().listConfig()).all,
		},
		count: contexts.length,
		start: performance.now(),
		end: 0,
		actions: [],
		status: 'applying',
		applyOptions,
		localPreset,
		prompts: {},
	}

	debug.context('Adding preset context to the stack:', objectWithoutKeys(context, 'git'))
	contexts.push(context)

	return context
}

/**
 * Adds an action to the context.
 * @internal
 */
export function createActionContext<Options extends Object, ResolvedOptions extends ActionOptions<Options>>(
	presetContext: PresetContext,
	name: string,
	options: ResolvedOptions,
	groupAction?: ActionContext,
) {
	const context: ActionContext<ResolvedOptions> = {
		name,
		options,
		id: randomUUID(),
		presetContextId: presetContext.id,
		groupContextId: groupAction?.id,
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
 * @internal
 */
export function getCurrentPresetContext(): PresetContext | undefined {
	debug.context(`Retrieving the current context from the stack (count: ${contexts.length}).`)

	const context = contexts.at(-1)

	if (!context) {
		throw new PresetError({ code: 'ERR_MISSING_CONTEXT', details: 'Context could not be found in the context stack. This might cause issues.' })
	}

	debug.context('Current context:', objectWithoutKeys(context, 'git'))

	return context
}

/**
 * Marks the context as finished.
 */
export function finishPresetContext(context: PresetContext, status: Status, error?: PresetError) {
	context.status = status
	context.end = performance.now()

	if (error) {
		context.error = error
	}
}

/**
 * Mark action as finished.
 * @internal
 */
export function finishActionContext(action: LastArrayElement<PresetContext['actions']>, status: Status, error?: PresetError) {
	action.status = status
	action.end = performance.now()

	if (error) {
		action.error = error
	}
}

/**
 * Removes the current context from the context stacks.
 * @internal
 */
export function popCurrentContext(): void {
	debug.context('Destroying the current context.')

	if (!contexts.pop()) {
		debug.context('No context found to destroy')
	}
}
