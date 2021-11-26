import { Promisable } from 'type-fest'
import { emitter } from './events'
import { makeDebugger, makeDynamicDebugger } from './utils'

export type ActionResult = boolean
export type ActionHandlerParameters<T = void> = {
	context: PresetContext
	options: T
}
export type ActionHandler<T = void> = (parameters: ActionHandlerParameters<T>) => Promisable<ActionResult>
export type Action<T = void> = (options: T) => Promise<void>

export type PresetResult = boolean | void
export type PresetHandler = (context: PresetContext) => Promise<PresetResult>
export interface Preset {
	name: string
	apply: (context?: PresetContext) => Promise<void>
}

/**
 * Represents the context of a preset.
 */
export interface PresetContext {
	/**
	 * The preset name.
	 */
	name: string

	/**
	 * Parsed command-line flags.
	 */
	flags: {
		[name: string]: any
	}

	/**
	 * @internal
	 */
	errors: Array<{ action: string; error: Error }>
}

/**
 * Represents the options that define a preset.
 */
export interface PresetOptions {
	/**
	 * The preset name.
	 */
	name: string

	/**
	 * Definitions of command line flags.
	 */
	flags: {
		[name: string]: any
	}

	/**
	 * The preset's script handler.
	 */
	handler: PresetHandler
}

const debug = {
	core: makeDebugger('preset:core'),
	action: makeDynamicDebugger('preset:action'),
	preset: makeDynamicDebugger('preset:execution'),
	// action: (name: string, formatter: any, ...args: any[]) => createDebugger(`preset:action:${name}`)(formatter, ...args),
	// preset: (name: string, formatter: any, ...args: any[]) => createDebugger(`preset:execution:${name}`)(formatter, ...args),
}

/**
 * Context map, in order of execution.
 */
const contexts: PresetContext[] = []

/**
 * Creates the context for the given preset.
 */
function createPresetContext(options: PresetOptions): PresetContext {
	debug.core(`Creating a new context for "${options.name}".`)

	const context = {
		name: options.name,
		flags: options.flags, // TODO
		errors: [],
	}

	debug.core('Adding context to the stack:', context)
	contexts.push(context)

	return context
}

/**
 * Gets the context for the current preset.
 */
function getCurrentContext(): PresetContext | undefined {
	debug.core('Retrieving the current context.')

	const context = contexts.at(-1)

	if (!context) {
		debug.core('Context could not be found in the context stack. This might cause issues.')
	}

	debug.core('Current context:', context)

	return context
}

/**
 * Removes the current context from the context stacks.
 */
function destroyCurrentContext(): void {
	debug.core('Destroying the current context.')

	if (!contexts.pop()) {
		debug.core('No context found to destroy')
	}
}

/**
 * Defines a preset.
 *
 * @param name The preset name.
 * @param preset The preset's script.
 */
export function definePreset(options: PresetOptions): Preset {
	return {
		name: options.name,
		apply: async(context) => {
			debug.preset(options.name, `Applying preset "${options.name}".`)
			emitter.emit('preset:start', options.name)

			try {
				// Creates context if needed
				context ??= createPresetContext(options)

				debug.preset(options.name, 'Preset context:', context)
				debug.preset(options.name, 'Executing handler.')

				// Executes the handler
				if ((await options.handler(context)) === false) {
					debug.preset(options.name, 'Handler returned false, throwing.')
					throw new Error('Action failed without throwing.')
				}

				// If there was errors during the execution
				if (context.errors.length) {
					debug.preset(options.name, 'One or more actions failed.')
					throw new Error('One or more actions failed.')
				}

				debug.preset(options.name, 'Handler executed without throwing.')
				emitter.emit('preset:success', options.name)
			} catch (error) {
				debug.preset(options.name, 'Handler threw an error:', error)
				emitter.emit('preset:failed', options.name, error as Error)
			}

			emitter.emit('preset:end', options.name)

			// Destroys the context
			destroyCurrentContext()
		},
	}
}

/**
 * Defines an action handler.
 *
 * @param name The action name.
 * @param preset The action's script.
 */
export function defineAction<T = void>(name: string, action: ActionHandler<T>): Action<T> {
	return async(options: T) => {
		debug.action(name, `Running action "${name}".`)
		emitter.emit('action:start', name)

		const context = getCurrentContext()

		try {
			if (!await action({ options, context: context as PresetContext })) {
				debug.action(name, 'Action handler returned false, throwing.')
				throw new Error('Action failed without throwing.')
			}

			debug.action(name, 'Handler executed without throwing.')
			emitter.emit('action:success', name)
		} catch (error: any) {
			context?.errors.push({
				action: name,
				error,
			})

			debug.action(name, 'Handler threw an error:', error)
			emitter.emit('action:failed', name, error as Error)
		}

		emitter.emit('action:end', name)
	}
}

export { emitter }
export * from './actions'
