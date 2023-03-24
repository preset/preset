import { defineAction } from '../api'
import { execute } from '../utils'

export interface ExecuteCommandOptions {
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

	/**
	 * If true, exit code will be ignored.
	 */
	ignoreExitCode?: boolean
	/**
	 * Environment variables for this command.
	 */
	env?: Record<string, string>
}

/**
 * Executes a shell command. This uses `execa` under the hood.
 */
export const executeCommand = defineAction<ExecuteCommandOptions>('execute-command', async({ options, presetContext }) => {
	return await execute(
		options.command,
		options.arguments ?? [],
		options.data ?? (() => {}),
		presetContext.applyOptions.targetDirectory,
		{ reject: !options.ignoreExitCode, env: options.env },
		options.ignoreExitCode,
	)
})
