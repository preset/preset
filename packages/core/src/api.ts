import fs from 'fs-extra'
import { debug, objectWithoutKeys } from './utils'
import { emitter } from './events'
import { popCurrentContext, getCurrentPresetContext, finishPresetContext, createActionContext, finishActionContext } from './context'
import type { DefinePresetOptions, Preset, ActionHandler, Action, PresetFlags } from './types'
import { PresetError } from './errors'

/**
 * Defines a preset.
 *
 * @param name The preset name.
 * @param preset The preset's script.
 */
export function definePreset<Options extends PresetFlags>(preset: DefinePresetOptions<Options>): Preset<Options> {
	if (!preset.name || !preset.handler) {
		throw new PresetError({ code: 'ERR_INVALID_PRESET', details: 'Preset configuration is missing a name or an handler.' })
	}

	return {
		name: preset.name,
		options: preset.options ?? {} as any,
		postInstall: preset.postInstall,
		apply: async(context) => {
			debug.preset(preset.name, `Applying preset "${preset.name}".`)
			emitter.emit('preset:start', context)

			try {
				debug.context(preset.name, 'context', objectWithoutKeys(context, 'git'))
				debug.preset(preset.name, 'Executing handler.')

				// Creates the target directory if needed, except in tests
				if (!process.env.VITEST && !await fs.pathExists(context.applyOptions.targetDirectory)) {
					debug.preset(preset.name, 'Target directory does not exist, creating it.')
					await fs.ensureDir(context.applyOptions.targetDirectory)
				}

				// Executes the handler
				if ((await preset.handler(context)) === false) {
					debug.preset(preset.name, 'Preset handler returned false, throwing.')
					throw new PresetError({ code: 'ERR_PRESET_FAILED', details: 'Preset failed to execute properly.' })
				}

				// If there was errors during the execution
				if (context.actions.some(({ error }) => Boolean(error))) {
					debug.preset(preset.name, 'One or more actions failed.', context.actions.map((action) => ({ name: action.name, error: action.error })))
					throw new PresetError({ code: 'ERR_ACTIONS_FAILED', details: 'Some of the actions of the preset failed.' })
				}

				finishPresetContext(context, 'applied')

				debug.preset(preset.name, 'Preset handler executed without throwing.')
				emitter.emit('preset:success', context)
			} catch (parent: any) {
				const error = new PresetError({ code: 'ERR_PRESET_FAILED', details: `Preset ${preset.name} threw an error.`, parent })

				finishPresetContext(context, 'failed', error)

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
		const groupAction = presetContext.actions.find((action) => action.name === 'group' && action.status === 'applying')
		const actionContext = createActionContext(presetContext, name, resolved, groupAction)

		emitter.emit('action:start', actionContext)

		try {
			if (!await action({ options: resolved, presetContext, actionContext, name })) {
				throw new PresetError({ code: 'ERR_ACTION_FAILED', details: `Action ${name} was not successful.` })
			}

			finishActionContext(actionContext, 'applied')

			debug.action(name, 'Action handler executed without throwing.')
			emitter.emit('action:success', actionContext)
		} catch (parent: any) {
			const error = new PresetError({ code: 'ERR_ACTION_FAILED', details: `Action ${name} threw an error.`, parent })

			finishActionContext(actionContext, 'failed', error)

			emitter.emit('action:fail', actionContext)
		}

		emitter.emit('action:end', actionContext)
	}
}
