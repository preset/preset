import * as fsp from 'fs/promises'
import { findNearestFile, readPackageJSON } from 'pkg-types'
import { debug } from './utils'

/**
 * Resolves the preset and returns its path.
 */
export async function resolvePreset(resolvable: string) {
	// if relative path -> use it
	// if absolute path -> use it
	// if org/repo -> download + cache

	// https://github.com/tiged/tiged

	return ''
}

async function resolveFromGitHub(resolvable: string) {
	debug.resolve(`Resolving from GitHub: ${resolvable}`)
	// TODO
}

async function resolveFromFilesystem(resolvable: string) {
	debug.resolve(`Resolving from filesystem: ${resolvable}`)
	const access = await fsp.stat(resolvable).catch(() => undefined)

	if (!access) {
		debug.resolve(`${resolvable} does not exist on disk.`)
		throw new Error(`Could not resolve ${resolvable}.`)
	}

	return access.isDirectory()
		? resolvePresetFile(resolvable)
		: resolvable
}

/**
 * Resolves the preset file in the given directory.
 *
 * @param directory Absolute path to the directory in which to find the preset file.
 */
export async function resolvePresetFile(directory: string) {
	debug.resolve(`Resolving preset file in "${directory}"."`)
	const pkg = await readPackageJSON(directory) as any

	return await findNearestFile('preset.ts', { startingFrom: directory }) ?? pkg.preset
}
