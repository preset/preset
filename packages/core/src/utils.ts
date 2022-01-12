// eslint-disable-next-line import/named
import { execa, CommonOptions } from 'execa'
import createDebugger from 'debug'

export const debug = {
	apply: makeDebugger('preset:core:apply'),
	resolve: makeDebugger('preset:core:resolve'),
	import: makeDebugger('preset:core:import'),
	context: makeDebugger('preset:core:context'),
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
export function wrap<T>(value: T | T[]): T[] {
	if (!value) {
		return []
	}

	if (!Array.isArray(value)) {
		value = [value]
	}

	return value
}

export function invoke(fn: Function) {
	return fn()
}

/**
 * Executes the given command.
 */
export async function execute(command: string, args: string[] = [], fn: (log: string) => void, cwd: string, options: CommonOptions<'utf8'> = {}): Promise<boolean> {
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

	return !failed
}
