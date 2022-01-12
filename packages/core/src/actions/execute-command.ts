import { defineAction } from '../api'
import { execute } from '../utils'

export interface ExecuteOptions {
	/**
	 * The command/process to execute.
	 */
	command: string

	/**
	 * A list of arguments to pass to the process.
	 */
	arguments?: string[]

	/**
	 * A callback called each time stdout or stdin prints a line.
	 */
	data?: (stdout: string) => void
}

export const executeCommand = defineAction<ExecuteOptions>('execute-command', async({ options, presetContext }) => {
	return await execute(
		options.command,
		options.arguments ?? [],
		options.data ?? (() => {}),
		presetContext.applyOptions.targetDirectory,
	)
})
