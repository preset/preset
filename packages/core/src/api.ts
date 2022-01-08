import { debug } from './utils'
import { emitter } from './events'
import { popCurrentContext, getCurrentPresetContext, finishPresetContext, createActionContext, finishActionContext } from './context'
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
					throw new Error('Preset failed to execute properly.')
				}

				// If there was errors during the execution
				if (context.actions.some(({ error }) => Boolean(error))) {
					debug.preset(preset.name, 'One or more actions failed.')
					throw new Error('One or more actions failed.')
				}

				finishPresetContext(context, 'applied')

				debug.preset(preset.name, 'Preset handler executed without throwing.')
				emitter.emit('preset:success', context)
			} catch (error: any) {
				finishPresetContext(context, 'failed', error)

				debug.preset(preset.name, 'Preset handler threw an error:', error)
				emitter.emit('preset:fail', context)

				return false
			} finally {
				emitter.emit('preset:end', context)
				popCurrentContext()
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
export function defineAction<Options extends Object, OptionsWithDefault extends Options = Options>(
	name: string,
	action: ActionHandler<OptionsWithDefault>,
	defaultOptions?: OptionsWithDefault,
): Action<Options> {
	return async(options: any) => {
		debug.action(name, `Running action "${name}".`)

		const resolved: OptionsWithDefault = {
			...defaultOptions ?? {},
			...options ?? {},
		}

		debug.action(name, 'Resolved options:', resolved)

		const presetContext = getCurrentPresetContext()!
		const actionContext = createActionContext(presetContext, name, resolved)

		emitter.emit('action:start', actionContext)

		try {
			if (!await action({ options: resolved, presetContext, actionContext, name })) {
				debug.action(name, 'Action handler returned false, throwing.')
				throw new Error('Action failed to execute properly.')
			}

			finishActionContext(actionContext, 'applied')

			debug.action(name, 'Action handler executed without throwing.')
			emitter.emit('action:success', actionContext)
		} catch (error: any) {
			finishActionContext(actionContext, 'failed', error)

			debug.action(name, 'Action handler threw an error:', error)
			emitter.emit('action:fail', actionContext)
		}

		emitter.emit('action:end', actionContext)
	}
}
