import { debug, execute, wrap, detectNodePackageManager, invoke } from '../utils'
import { PresetError } from '../errors'
import { defineAction } from '../api'
import { config } from '../config'
import type { NodePackageManager } from '../types'

const ACTION_NAME = 'install-packages'

async function getNodePackageManagerInstallArguments(cwd: string, options: InstallPackagesOptions): Promise<[string, string[]]> {
	const packageManager = options.packageManager ?? await detectNodePackageManager(cwd) ?? config.defaultNodeAgent ?? 'npm'
	const packageNames = wrap(options.install ?? options.packages)
	const args = options.additionalArgs || []

	debug.action(ACTION_NAME, `Using package manager: ${packageManager}`)

	if (packageManager === 'npm') {
		return [packageManager, [
			options.type!,
			options.dev ? '-D' : '',
			...args,
			...packageNames,
		].filter(Boolean)]
	}

	if (packageManager === 'pnpm') {
		return [packageManager, [
			options.type!,
			options.dev ? '-D' : '',
			...args,
			...packageNames,
		].filter(Boolean)]
	}

	if (packageManager === 'yarn') {
		const command = invoke(() => {
			if (options.type === 'update') {
				return 'upgrade'
			}

			if (packageNames.length) {
				return 'add'
			}

			return 'install'
		})

		return [packageManager, [
			command,
			options.dev ? '-D' : '',
			...args,
			...packageNames,
		].filter(Boolean)]
	}

	throw new PresetError({ code: 'ERR_ACTION_FAILED', details: `Package manager "${packageManager}" is not supported.` })
}

async function getComposerInstallArguments(cwd: string, options: InstallPackagesOptions): Promise<[string, string[]]> {
	const packageNames = wrap(options.install ?? options.packages)
	const args = options.additionalArgs || []

	return ['composer', [
		packageNames.length > 0 ? 'require' : options.type!,
		options.dev ? '--dev' : '',
		'--no-interaction',
		...args,
		...packageNames,
	].filter(Boolean)]
}

/**
 * Installs packages for the given environment, by calling the package manager directly via `execa`.
 * If you install multiple packages, you may want to pass them all to the `install` option instead of calling the action multiple times.
 */
export const installPackages = defineAction<InstallPackagesOptions>(
	ACTION_NAME,
	async({ options, presetContext, actionContext }) => {
		const cwd = presetContext.applyOptions.targetDirectory
		const args = await {
			node: () => getNodePackageManagerInstallArguments(cwd, options),
			php: () => getComposerInstallArguments(cwd, options),
		}[options.for!]()

		debug.action(actionContext.name, `Installing packages in ${cwd}`, args)

		if (!['node', 'php'].includes(options.for || '')) {
			throw new PresetError({ code: 'ERR_ACTION_FAILED', details: `Environment "${options.for || '<not given>'}" is not supported.` })
		}

		return await execute(
			...args,
			(log: string) => {
				actionContext.log.push(log)
				debug.action(actionContext.name, log)
			},
			cwd,
		)
	},
	{
		for: 'node',
		type: 'install',
		packages: [],
		dev: false,
		additionalArgs: [],
	},
)

export interface InstallPackagesOptions {
	/**
	 * The environment for which to install the dependencies. Defaults to Node.
	 */
	for?: 'node' | 'php'

	/**
	 * The type of installation.
	 */
	type?: 'install' | 'update'

	/**
	 * The dependencies to install. Use `packages` instead.
	 * @deprecated
	 */
	install?: string | string[]

	/**
	 * The dependencies to install.
	 */
	packages?: string | string[]

	/**
	 * For node, specify the package manager.
	 */
	packageManager?: NodePackageManager

	/**
	 * Whether these are development dependencies.
	 */
	dev?: boolean

	/**
	 * Additional arguments to give to the package manager.
	 */
	additionalArgs?: string[]
}
