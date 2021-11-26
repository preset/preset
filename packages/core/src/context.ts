import cac from 'cac'
import simpleGit from 'simple-git'
import { debug } from './utils'
import type { ContextCreationOptions, Preset, PresetContext } from './types'

/**
 * Context map, in order of execution.
 */
const contexts: PresetContext[] = []

/**
  * Creates the context for the given preset.
  */
export async function createPresetContext(preset: Preset, options: ContextCreationOptions): Promise<PresetContext> {
	debug.context(`Creating a new context for "${preset.name}".`)

	const context: PresetContext = {
		...cac().parse(['', '', ...options.args]),
		name: preset.name,
		errors: [],
		git: {
			instance: simpleGit(process.cwd()),
			config: (await simpleGit().listConfig()).all,
		},
	}

	debug.context('Adding context to the stack:', context)
	contexts.push(context)

	return context
}

/**
  * Gets the context for the current preset.
  */
export function getCurrentContext(): PresetContext | undefined {
	debug.context(`Retrieving the current context from the stack (count: ${contexts.length}).`)

	const context = contexts.at(-1)

	if (!context) {
		debug.context('Context could not be found in the context stack. This might cause issues.')
	}

	debug.context('Current context:', context)

	return context
}

/**
  * Removes the current context from the context stacks.
  */
export function destroyCurrentContext(): void {
	debug.context('Destroying the current context.')

	if (!contexts.pop()) {
		debug.context('No context found to destroy')
	}
}
