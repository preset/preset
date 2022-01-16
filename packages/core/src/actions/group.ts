import { defineAction } from '../api'

export interface GroupOptions {
	/**
	 * The callback that will executes actions in a group.
	 */
	handler: () => Promise<void>
}

/**
 * Runs actions in a group.
 */
export const group = defineAction<GroupOptions>('group', async({ options, presetContext, actionContext }) => {
	await options.handler()

	return presetContext.actions
		.filter((child) => child.groupContextId === actionContext.id)
		.every((child) => child.status === 'applied')
})
