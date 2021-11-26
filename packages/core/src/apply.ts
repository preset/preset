import { createPresetContext } from './context'
import type { Preset } from './types'

export interface ApplyOptions {
	/**
	 * A string that resolves to a preset.
	 *
	 * @see the-docs
	 */
	resolvable: string

	/**
	 * The *absolute* path to the directory in which to apply the preset.
	 */
	targetDirectory: string

	/**
	 * The command-line arguments, without the first two from argv.
	 */
	args: string[]

	/**
   * List of command line options.
   */
	options: {
		/**
		 * The path to a sub-directory in which to look for a preset.
		 */
		path?: string

		/**
		 * Whether to use SSH.
		 */
		ssh?: boolean

		[k: string]: any
	}
}

export async function applyPreset(options: ApplyOptions) {
	// resolve
	// TODO

	// cache
	// TODO

	// import
	// TODO
	const preset = null as unknown as Preset

	// create context
	const context = await createPresetContext(preset, {
		args: options.args,
		targetDirectory: options.targetDirectory,
	})

	// apply
	await preset.apply(context)
}
