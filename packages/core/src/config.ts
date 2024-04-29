import os from 'node:os'
import type { ReadonlyDeep } from 'type-fest'
import { loadConfig } from 'unconfig'
import type { PresetConfiguration } from './types'
import { debug } from './utils'

export const config: ReadonlyDeep<PresetConfiguration> = {
	defaultNodeAgent: 'npm',
	aliases: {},
}

export function resetConfig() {
	replaceConfig({
		defaultNodeAgent: 'npm',
		aliases: {},
	})
}

export function replaceConfig(replacement: Partial<PresetConfiguration>) {
	for (const [key, value] of Object.entries(replacement)) {
		debug.config('Setting config:', key, value)
		Reflect.set(config, key, value)
	}

	debug.config('Replaced config:', config)
}

export async function initializeConfig(): Promise<PresetConfiguration> {
	debug.config('Initializing config')

	const result = await loadConfig<PresetConfiguration>({
		cwd: os.homedir(),
		sources: {
			files: ['preset', '.presetrc'],
			extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json', ''],
		},
		defaults: config,
	})

	debug.config('Loaded config:', result)
	replaceConfig(result.config)

	return config
}
