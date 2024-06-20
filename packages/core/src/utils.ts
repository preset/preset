import fs from 'node:fs'
import path from 'node:path'

import { type Options as CommonOptions, execa } from 'execa'
import createDebugger from 'debug'
import type { NodePackageManager } from './types'

export const debug = {
	error: makeDebugger('preset:core:error'),
	apply: makeDebugger('preset:core:apply'),
	resolve: makeDebugger('preset:core:resolve'),
	import: makeDebugger('preset:core:import'),
	context: makeDebugger('preset:core:context'),
	config: makeDebugger('preset:core:config'),
	utils: makeDebugger('preset:core:utils'),
	action: makeDynamicDebugger('preset:core:action'),
	preset: makeDynamicDebugger('preset:core:execution'),
}

export function makeDebugger(baseName: string) {
	return createDebugger(baseName)
}

export function makeDynamicDebugger(baseName: string) {
	return (name: string, content: any, ...args: any[]) => createDebugger(`${baseName}:${name}`)(content, ...args)
}

/**
 * Wraps the value in an array if necessary.
 */
export function wrap<T>(value: T | T[]): NonNullable<T>[] {
	if (!value) {
		return []
	}

	if (!Array.isArray(value)) {
		value = [value]
	}

	return value as NonNullable<T>[]
}

export function invoke(fn: Function) {
	return fn()
}

/**
 * Executes the given command.
 */
export async function execute(
	command: string,
	args: string[] = [],
	fn: (log: string) => void,
	cwd: string,
	options: CommonOptions = {},
	ignoreExitCode: boolean = false,
): Promise<boolean> {
	const result = execa(command, args, {
		cwd,
		all: true,
		...options,
	})

	result.all?.on('data', (data: Int32Array) => {
		Buffer.from(data)
			.toString('utf-8')
			.split(/[\n\r]/g)
			.map((str) => str.trim())
			.filter((str) => str.length > 0 && !str.includes('fund')) // to remove funding stuff from package managers, sorry :/
			.forEach((str) => fn(str))
	})

	const { failed } = await result

	return ignoreExitCode ? true : !failed
}

/**
 * Returns a clone of the given object without the specified keys.
 */
export function objectWithoutKeys<T extends object = object>(obj: T, ...keys: (keyof T)[]): Partial<T> {
	return (keys as any).reduce((a: Partial<T>, e: keyof T) => {
		const { [e]: _, ...rest } = a

		return rest
	}, obj)
}

/**
 * Detects the package manager used in the given directory.
 */
export async function detectNodePackageManager(directory: string) {
	const packageManager = process.env.npm_config_user_agent?.split('/')[0]
	if (packageManager && ['npm', 'yarn', 'pnpm', 'bun'].includes(packageManager)) {
		debug.utils(`Detected running package manager: ${packageManager}`)
		return packageManager
	}

	const packageLockFiles: Record<string, NodePackageManager> = {
		'bun.lockb': 'bun',
		'pnpm-lock.yaml': 'pnpm',
		'yarn.lock': 'yarn',
		'package-lock.json': 'npm',
	}

	for (const [packageLock, packageManager] of Object.entries(packageLockFiles)) {
		if (fs.existsSync(path.resolve(directory, packageLock))) {
			debug.utils(`Detected ${packageManager} in ${directory}`)

			return packageManager
		}
	}

	debug.utils(`No package manager detected in ${directory}`)

	return null
}
