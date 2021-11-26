import { debug } from './utils'
import { emitter } from './events'
import { destroyCurrentContext, getCurrentContext } from './context'
import type { PresetOptions, Preset, ActionHandler, Action, PresetContext } from './types'

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
