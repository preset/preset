import * as fsp from 'fs/promises'
import path from 'path'
import { findNearestFile, readPackageJSON } from 'pkg-types'
import { debug } from './utils'

/**
 * Resolves the preset and returns its path.
 *
 * TODO: support other resolvables than paths to a directory or preset file.
 */
export async function resolvePreset(resolvable: string) {
	// if relative path -> use it
	// if absolute path -> use it
	// if org/repo -> download + cache

	// https://github.com/tiged/tiged

	return resolveFromFilesystem(resolvable)
}

async function resolveFromGitHub(resolvable: string) {
	debug.resolve(`Resolving from GitHub: ${resolvable}`)
	// TODO
}

async function resolveFromFilesystem(resolvable: string) {
	debug.resolve(`Resolving from filesystem: ${resolvable}`)

	// if exists + is absolute
	// if exists + starts with '/' or './' or '../'

	const access = await fsp.stat(resolvable).catch((e) => {
		debug.resolve(e)
	})

	if (!access) {
		debug.resolve(`${resolvable} does not exist on disk.`)
		throw new Error(`Could not resolve "${resolvable}".`)
	}

	const file = access.isDirectory()
		? await resolvePresetFile(resolvable)
		: resolvable

	return path.resolve(file)
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
