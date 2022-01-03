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
export function definePreset(preset: PresetOptions): Preset {
	return {
		name: preset.name,
		flags: preset.flags ?? {},
		apply: async(context) => {
			debug.preset(preset.name, `Applying preset "${preset.name}".`)
			emitter.emit('preset:start', context)

			try {
				debug.context(preset.name, ' context:', context)
				debug.preset(preset.name, 'Executing handler.')

				// Executes the handler
				if ((await preset.handler(context)) === false) {
					debug.preset(preset.name, 'Preset handler returned false, throwing.')
					throw new Error('Action failed without throwing.')
				}

				// If there was errors during the execution
				if (context.errors.length) {
					debug.preset(preset.name, 'One or more actions failed.')
					throw new Error('One or more actions failed.')
				}

				debug.preset(preset.name, 'Preset handler executed without throwing.')
				emitter.emit('preset:success', context)
			} catch (error: any) {
				debug.preset(preset.name, 'Preset handler threw an error:', error)
				emitter.emit('preset:fail', context, error)

				return false
			} finally {
				emitter.emit('preset:end', context)
				destroyCurrentContext()
			}

			return true
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

		emitter.emit('action:start', name, context)

		try {
			const resolved = {
				...defaultOptions ?? {},
				...options ?? {},
			} as ReadonlyDeep<Required<T>>

			if (!await action({ options: resolved, context, name })) {
				debug.action(name, 'Action handler returned false, throwing.')
				throw new Error('Action failed without throwing.')
			}

			debug.action(name, 'Action handler executed without throwing.')
			emitter.emit('action:success', name, context)
		} catch (error: any) {
			context?.errors.push({
				action: name,
				error,
			})

			debug.action(name, 'Action handler threw an error:', error)
			emitter.emit('action:fail', name, context, error)
		}

		emitter.emit('action:end', name, context)
	}
}
