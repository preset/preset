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
