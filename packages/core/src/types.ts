import { ConfigValues, SimpleGit } from 'simple-git'
import { Promisable, ReadonlyDeep } from 'type-fest'

export type ActionResult = boolean
export type ActionHandlerParameters<T = void> = {
	context: PresetContext
	options: ReadonlyDeep<Required<T>>
}

export type ActionHandler<T = void> = (parameters: ActionHandlerParameters<T>) => Promisable<ActionResult>
export type Action<T = void> = (options: T) => Promise<void>

export type PresetResult = boolean | void
export type PresetHandler = (context: PresetContext) => Promise<PresetResult>
export interface Preset {
	name: string
	flags: { [name: string]: any }
	apply: (context: PresetContext) => Promise<void>
}

/**
 * Represents the options that define a preset.
 */
export interface PresetOptions {
	/**
	 * The preset name.
	 */
	name: string

	/**
	 * Definitions of command line flags.
	 */
	flags?: {
		[name: string]: any
	}

	/**
	 * The preset's script handler.
	 */
	handler: PresetHandler
}

/**
 * Represents final preset options.
 */
export type ResolvedPresetOptions = ContextCreationOptions | PresetOptions

/**
 * Options for context creation.
 */
export interface ContextCreationOptions {
	/**
	 * Command-line arguments passed for this preset.
	 */
	args: string[]

	/**
	 * Absolute path to which the preset is applied.
	 */
	targetDirectory: string
}

/**
 * Represents the context of a preset.
 */
export interface PresetContext {
	/**
	 * The preset name.
	 */
	name: string

	/**
	 * Parsed command-line flags.
	 */
	options: Record<string, any>

	/**
	 * Parsed command-line args.
	 */
	args: readonly string[]

	/**
	 * @internal
	 */
	errors: Array<{ action: string; error: Error }>

	/**
	 * Git context.
	 */
	git: {
		/**
		 * Local git configuration.
		 */
		config: ConfigValues

		/**
		 * Simple Git instance.
		 */
		instance: SimpleGit
	}
}

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
