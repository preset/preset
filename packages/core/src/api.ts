import { ReadonlyDeep } from 'type-fest'
import { debug } from './utils'
import { emitter } from './events'
import { destroyCurrentContext, getCurrentContext } from './context'
import type { PresetOptions, Preset, ActionHandler, Action } from './types'

/**
 * Defines a preset.
 *
 * @param name The preset name.
 * @param preset The preset's script.
 */
export function definePreset(options: PresetOptions): Preset {
	return {
		name: options.name,
		flags: options.flags ?? {},
		apply: async(context) => {
			debug.preset(options.name, `Applying preset "${options.name}".`)
			emitter.emit('preset:start', context)

			try {
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
				emitter.emit('preset:success', context)
			} catch (error: any) {
				debug.preset(options.name, 'Handler threw an error:', error)
				emitter.emit('preset:failed', context, error)
			}

			emitter.emit('preset:end', context)

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
export function defineAction<T = void>(name: string, action: ActionHandler<T>, defaultOptions?: Required<T>): Action<T> {
	return async(options) => {
		debug.action(name, `Running action "${name}".`)

		const context = getCurrentContext()!

		emitter.emit('action:start', context)

		try {
			const resolved = {
				...defaultOptions ?? {},
				...options ?? {},
			} as ReadonlyDeep<Required<T>>

			if (!await action({ options: resolved, context })) {
				debug.action(name, 'Action handler returned false, throwing.')
				throw new Error('Action failed without throwing.')
			}

			debug.action(name, 'Handler executed without throwing.')
			emitter.emit('action:success', context)
		} catch (error: any) {
			context?.errors.push({
				action: name,
				error,
			})

			debug.action(name, 'Handler threw an error:', error)
			emitter.emit('action:failed', context, error)
		}

		emitter.emit('action:end', context)
	}
}
