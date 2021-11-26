import createDebugger from 'debug'

export function makeDebugger(baseName: string) {
	return createDebugger(baseName)
}

export function makeDynamicDebugger(baseName: string) {
	return (name: string, content: any, ...args: any[]) => createDebugger(`${baseName}:${name}`)(content, ...args)
}
