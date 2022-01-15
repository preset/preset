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
export const group = defineAction<GroupOptions>('group', async({ options }) => {
	await options.handler()

	return true
})
