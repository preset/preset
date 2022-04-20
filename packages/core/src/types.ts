import { ConfigValues, SimpleGit } from 'simple-git'
import { Promisable } from 'type-fest'
import { PresetError } from './errors'

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

type Colorize = (text: string) => string
interface PostInstallCallbackOptions<Options extends PresetFlags> {
	/**
	 * The preset context.
	 */
	context: PresetContext<Options>
	/**
	 * A highlight callback.
	 */
	hl: Colorize
	/**
	 * A bold callback.
	 */
	b: Colorize
}
export type PostInstall<Options extends PresetFlags> = string[] | ((options: PostInstallCallbackOptions<Options>) => string[])
export type PresetResult = boolean | void
export type PresetFlags = { [name: string]: any }
export type PresetHandler<Options extends PresetFlags> = (context: PresetContext<Options>) => Promise<PresetResult>
export interface Preset<Options extends PresetFlags = PresetFlags> {
	/**
	 * Preset name.
	 */
	name: string

	/**
	 * Default options for this preset.
	 */
	options: Options

	/**
	 * Handler that executes this preset.
	 */
	apply: (context: PresetContext<Options>) => Promise<boolean>

	/**
	 * Messages to write post-installation.
	 */
	postInstall?: PostInstall<Options>
}

/**
 * Represents the options that define a preset.
 */
export interface DefinePresetOptions<Options extends PresetFlags = PresetFlags> {
	/**
	 * The preset name.
	 */
	name: string

	/**
	 * Default options for this preset.
	 */
	options?: Options

	/**
	 * Handler that executes this preset.
	 */
	handler: PresetHandler<Options>

	/**
	 * Messages to write post-installation.
	 */
	postInstall?: PostInstall<Options>
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
	 * The ID of its group action context.
	 */
	groupContextId?: string

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
	 * Potential logs from the action.
	 */
	log: string[]

	/**
	 * Potential error.
	 */
	error?: PresetError

	/**
	 * Optional title to display in the logs.
	 */
	title?: string
}

/**
 * Represents the context of a preset.
 */
export interface PresetContext<Options extends PresetFlags = PresetFlags> {
	/**
	 * A unique identifier.
	 */
	id: string

	/**
	 * Preset name.
	 */
	name: string

	/**
	 * Initial preset object.
	 */
	preset: Readonly<Preset>

	/**
	 * Preset status.
	 */
	status: Status

	/**
	 * Parsed command-line options.
	 */
	options: Options

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
	error?: PresetError

	/**
	 * Prompt responses.
	 */
	prompts: Record<string, string | undefined>
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
	rawArguments: readonly string[]

	/**
   * List of parsed command line options.
   */
	parsedOptions: {
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

		[k: string]: any
	}

	/**
	 * Context ID of the action that called this preset, if the preset is nested.
	 */
	actionContextId?: string

	/**
	 * Applies the preset without using the global config.
	 */
	withoutGlobalConfig?: boolean
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

	/**
	 * The version required by the preset.
	 */
	presetVersion?: string
}

/**
 * Represents a preset in a distant repository.
 */
export interface RepositoryPreset {
	type: 'repository'
	organization: string
	repository: string
	ssh: boolean
	path: string
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

export interface PromptInput {
	id: string
	actionContextId: string
	name: string
	text: string
	default?: string
}

export interface PromptResponse {
	id: string
	response?: string
}

export type NodePackageManager = 'pnpm' | 'yarn' | 'npm'

export interface PresetConfiguration {
	defaultNodeAgent: NodePackageManager
	aliases: Record<string, ResolvedPreset>
}
