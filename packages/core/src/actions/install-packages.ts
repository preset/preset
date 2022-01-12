import path from 'node:path'
import fs from 'node:fs'
import { debug, execute } from '../utils'
import { defineAction } from '../api'

// https://github.com/antfu/install-pkg
export type PackageManager = 'pnpm' | 'yarn' | 'npm'

export interface InstallPackagesOptions {
	/**
	 * The environment for which to install the dependencies.
	 */
	for: 'node' | 'php'

	/**
	 * The dependencies to install.
	 */
	install: string | string[]

	/**
	 * For node, specify the package manager.
	 */
	packageManager?: PackageManager

	/**
	 * Whether these are development dependencies.
	 */
	dev?: boolean

	/**
	 * Additional arguments to give to the package manager.
	 */
	additionalArgs?: string[]
}

async function detectNodePackageManager(cwd: string) {
	const packageLockFiles: Record<string, PackageManager> = {
		'pnpm-lock.yaml': 'pnpm',
		'yarn.lock': 'yarn',
		'package-lock.json': 'npm',
	}

	for (const [packageLock, packageManager] of Object.entries(packageLockFiles)) {
		if (fs.existsSync(path.resolve(cwd, packageLock))) {
			return packageManager
		}
	}

	return null
}

/**
 * Installs packages for the given environment, by calling the package manager directly via `execa`.
 * If you install multiple packages, you may want to pass them all to the `install` option instead of calling the action multiple times.
 */
export const installPackages = defineAction<InstallPackagesOptions>(
	'install-packages',
	async({ options, presetContext, actionContext }) => {
		const cwd = presetContext.applyOptions.targetDirectory
		const packageNames = Array.isArray(options.install) ? options.install : [options.install]
		const args = options.additionalArgs || []

		debug.action(actionContext.name, `Installing packages in ${cwd}`)
		debug.action(actionContext.name, 'Installing: ', packageNames)

		if (options.for === 'node') {
			const packageManager = options.packageManager ?? await detectNodePackageManager(cwd) ?? 'npm'
			debug.action(actionContext.name, `Using package manager: ${packageManager}`)

			return await execute(
				packageManager,
				[
					packageManager === 'yarn' ? 'add' : 'install',
					options.dev ? '-D' : '',
					...args,
					...packageNames,
				].filter(Boolean),
				(log: string) => {
					actionContext.log.push(log)
					debug.action(actionContext.name, log)
				},
				cwd,
			)
		}

		if (options.for === 'php') {
			return await execute(
				'composer',
				[
					'require',
					options.dev ? '--dev' : '',
					'--no-interaction',
					...args,
					...packageNames,
				].filter(Boolean),
				(log: string) => {
					actionContext.log.push(log)
					debug.action(actionContext.name, log)
				},
				cwd,
			)
		}

		throw new Error(`Environment "${options.for || '<not given>'}" is not supported.`)
	},
	{
		for: 'node',
		install: [],
		dev: false,
		additionalArgs: [],
	},
)
