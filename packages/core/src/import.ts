import vm from 'node:vm'
import fs from 'node:fs'
import path from 'node:path'
import { buildSync } from 'esbuild'
import type { Preset } from './types'
import { debug } from './utils'
import * as preset from './index'

/**
 * Imports the given preset file.
 * @param filepath
 * @returns
 */
export async function importPresetFile(filepath: string) {
	debug.import(`Importing ${filepath}.`)

	const script = fs.readFileSync(filepath, { encoding: 'utf-8' })
	const sanitizedScript = removeSelfImportStatement(script)

	return await evaluateConfiguration(sanitizedScript, path.dirname(filepath), filepath)
}

/**
 * Evaluates the configuration and returns the preset.
 */
async function evaluateConfiguration(script: string, directory: string, filepath: string) {
	const context = vm.createContext(createContext(directory, filepath))

	const code = transformScript(script, directory, filepath)
	vm.runInContext(code, context)

	const defaultExportKey = Object.keys(context).find((value) => value.endsWith('_default'))

	if (defaultExportKey) {
		const result = context[defaultExportKey] as Preset

		if (!result.name || !result.apply) {
			debug.import(result)
			throw new Error('Preset configuration is missing a name or an apply handler.')
		}

		debug.import(`Found default export "${defaultExportKey}":`, result.name)

		return result
	}

	throw new Error('Preset configuration is missing a default export.')
}

/**
 * Removes the import statements that concerns the core preset package.
 */
function removeSelfImportStatement(script: string) {
	debug.import('Removing "import" statements that import the core.')

	return script
		.split(/\r\n|\r|\n/)
		.filter((line) => {
			const lineImports = ['import', 'require'].some((statement) => line.includes(statement))
			const lineMentionsImportValue = ['@preset/core', ...Object.keys(preset)].some((imp) => line.includes(imp))

			if (lineImports && lineMentionsImportValue) {
				return false
			}

			return true
		})
		.join('\n')
}

/**
 * Transforms the raw script with esbuild so it can be imported in a VM.
 */
function transformScript(contents: string, resolveDir: string, sourcefile: string): string {
	debug.import('Transforming script with esbuild.')

	const { outputFiles } = buildSync({
		stdin: {
			contents,
			resolveDir,
			sourcefile,
			loader: 'ts',
		},
		platform: 'node',
		format: 'cjs',
		external: ['@preset/core'],
		bundle: true,
		write: false,
	})

	debug.import(`Transformed ${outputFiles.length}.`)

	return outputFiles[0].text
}

/**
 * Creates a VM context.
 */
function createContext(directory: string, filename: string): Record<string, any> {
	debug.import('Creating VM context.')

	const exports = {}
	const moduleGlobals = {
		exports,
		require,
		module: {
			exports,
			filename,
			id: filename,
			path: directory,
			require: typeof module !== 'undefined' ? module.require : require,
		},
		__dirname: directory,
		__filename: filename,
	}

	const nodeGlobals = {
		Buffer,
		clearImmediate,
		clearInterval,
		clearTimeout,
		console,
		global,
		process,
		queueMicrotask,
		setImmediate,
		setInterval,
		setTimeout,
		TextDecoder: (globalThis as any).TextDecorator,
		TextEncoder: (globalThis as any).TextEncoder,
		URL: (globalThis as any).URL,
		URLSearchParams: (globalThis as any).URLSearchParams,
		WebAssembly: (globalThis as any).WebAssembly,
	}

	return {
		...globalThis,
		...moduleGlobals,
		...nodeGlobals,
		...preset,
	}
}
