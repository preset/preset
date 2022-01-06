import { ConfigValues, SimpleGit } from 'simple-git'
import { Promisable } from 'type-fest'

export type ActionResult = boolean
export type ActionHandlerParameters<ResolvedOptions> = {
	/**
	 * The current preset's context.
	 */
	presetContext: PresetContext
	/**
	 * The current action's context.
	 */
	actionContext: ActionContext
	/**
	 * Options given to this action.
	 */
	options: ResolvedOptions
	/**
	 * The current action's name.
	 */
	name: Readonly<string>
}

type RequiredKeys<T> = { [K in keyof T]-?: ({} extends { [P in K]: T[K] } ? never : K) }[keyof T]

export type ActionHandler<T> = (parameters: ActionHandlerParameters<T>) => Promisable<ActionResult>
export type ActionOptions<T> = T extends undefined ? Pick<ActionContext, 'title'> : (T & Pick<ActionContext, 'title'>)
export type Action<T> = RequiredKeys<T> extends never
	? (options?: ActionOptions<T>) => Promise<void>
	: (options: ActionOptions<T>) => Promise<void>

export type PresetResult = boolean | void
export type PresetHandler = (context: PresetContext) => Promise<PresetResult>
export interface Preset {
	name: string
	flags: { [name: string]: any }
	apply: (context: PresetContext) => Promise<boolean>
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
 * Represents the status of an action or a preset.
 */
export type Status = 'applying' | 'applied' | 'failed'

/**
 * Represents the context of an action.
 */
export interface ActionContext<ResolvedOptions = ActionOptions<any>> {
	/**
	 * A unique identifier.
	 */
	id: string

	/**
	 * Resolved action options.
	 */
	options: ResolvedOptions

	/**
	 * The ID of its context.
	 */
	presetContextId: string

	/**
	 * The action name.
	 */
	name: string

	/**
	 * When the action started.
	 */
	start: number

	/**
	 * When the action ended.
	 */
	end: number

	/**
	 * Action status.
	 */
	status: Status

	/**
	 * Potential error.
	 */
	error?: Error

	/**
	 * Optional title to display in the logs.
	 */
	title?: string
}

/**
 * Represents the context of a preset.
 */
export interface PresetContext {
	/**
	 * A unique identifier.
	 */
	id: string

	/**
	 * Preset name.
	 */
	name: string

	/**
	 * Preset status.
	 */
	status: Status

	/**
	 * Parsed command-line flags.
	 */
	options: Record<string, any>

	/**
	 * Parsed command-line args.
	 */
	args: readonly string[]

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

	/**
	 * Apply options.
	 */
	applyOptions: ApplyOptions

	/**
	 * Context count.
	 */
	count: Readonly<number>

	/**
	 * When the preset started.
	 */
	start: number

	/**
	 * When the preset ended.
	 */
	end: number

	/**
	 * Action context log.
	 */
	actions: ActionContext[]

	/**
	 * Resolved local preset.
	 */
	localPreset: LocalPreset

	/**
	 * Potential error.
	 */
	error?: Error
}

export interface ApplyOptions {
	/**
	 * A string that resolves to a preset.
	 */
	resolvable: string

	/**
	 * The *absolute* path to the directory in which to apply the preset.
	 */
	targetDirectory: string

	/**
	 * The raw command-line arguments, without the first two from argv.
	 */
	args: readonly string[]

	/**
   * List of command line options.
   */
	commandLine?: {
		/**
		 * The path to a sub-directory in which to look for a preset.
		 */
		path?: string

		/**
		 * The tag of the repository.
		 */
		tag?: string

		/**
		 * Whether to use SSH.
		 */
		ssh?: boolean

		/**
		 * Whether to use cache.
		 */
		cache?: boolean

		[k: string]: any
	}

	/**
	 * Context ID of the action that called this preset, if the preset is nested.
	 */
	actionContextId?: string
}

/**
 * Represents a resolved preset.
 */
export type ResolvedPreset = RepositoryPreset | LocalFilePreset | LocalDirectoryPreset

/**
 * Represents local filesystem information for the preset.
 */
export interface LocalPreset {
	/**
	 * The absolute path to the root directory of the preset
	 */
	rootDirectory: string

	/**
	 * The absolute path to the preset file.
	 */
	presetFile: string
}

/**
 * Represents a preset in a distant repository.
 */
export interface RepositoryPreset {
	type: 'repository'
	organization: string
	repository: string
	ssh: boolean
	tag?: string
}

/**
 * Represents a preset in a local directory.
 */
export interface LocalDirectoryPreset {
	type: 'directory'
	path: string
}

/**
 * Represents a local file preset.
 */
export interface LocalFilePreset {
	type: 'file'
	path: string
}
