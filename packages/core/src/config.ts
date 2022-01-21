import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import { PresetConfiguration } from './types'
import { debug } from './utils'

export const presetrc = path.resolve(fs.realpathSync(os.homedir()), '.presetrc.json')

export const config: Readonly<PresetConfiguration> = {
	defaultNodeAgent: 'npm',
	aliases: {},
}

/**
 * Parses the configuration
 */
export function parseConfig(cfg: any): PresetConfiguration {
	debug.config('Parsing config:', cfg)

	const json = JSON.parse(cfg)

	return {
		defaultNodeAgent: json.defaultNodeAgent ?? 'npm',
		aliases: json.aliases ?? {},
	}
}

/**
 * Reads and parses the configuration from the given file.
 */
export function readConfig(filepath: string): PresetConfiguration {
	debug.config('Reading config from file:', filepath)

	return parseConfig(fs.readFileSync(filepath, { encoding: 'utf-8' }))
}

/**
 * Loads and cache the configuration from the given file.
 */
export function loadConfig(configOrPath?: string | Partial<PresetConfiguration>): PresetConfiguration {
	if (typeof configOrPath === 'object') {
		return saveConfig(configOrPath)
	}

	if (typeof configOrPath === 'string') {
		return saveConfig(readConfig(configOrPath))
	}

	return saveConfig(readConfig(presetrc))
}

/**
 * Saves the configuration.
 */
export function saveConfig(cfg: Partial<PresetConfiguration>): PresetConfiguration {
	debug.config('Saving configuration', cfg)
	Object.entries(cfg).forEach(([key, value]) => Reflect.set(config, key, value))

	return config
}
