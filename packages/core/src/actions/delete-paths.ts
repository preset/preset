import path from 'node:path'
import fs from 'fs-extra'
import fg from 'fast-glob'
import { defineAction } from '../api'
import { debug, wrap } from '../utils'

/**
 * Deletes the given paths from the target directory.
 */
export const deletePaths = defineAction<DeletePathsOptions>('delete-paths', async ({ options, actionContext, presetContext }) => {
	const pathsOrGlobs = wrap(options.paths)

	const deletePath = async (path: string) => {
		debug.action(actionContext.name, `Deleting path at "${path}".`)

		return await fs.rm(path, { force: true, recursive: true, maxRetries: 5 })
	}

	for (const pathOrGlobToDelete of pathsOrGlobs) {
		const absolutePathToDelete = path.resolve(presetContext.applyOptions.targetDirectory, pathOrGlobToDelete)

		// If the path actually exists, no need to glob it
		if (await fs.pathExists(absolutePathToDelete)) {
			await deletePath(absolutePathToDelete)
			continue
		}

		// Otherwise, glob it and delete the results
		const paths = await fg(pathOrGlobToDelete || '**/**', {
			ignore: ['node_modules', '.git', 'dist'],
			absolute: false,
			cwd: presetContext.applyOptions.targetDirectory,
			dot: true,
		})

		for (const pathToDelete of paths) {
			const absolutePathToDelete = path.resolve(presetContext.applyOptions.targetDirectory, pathToDelete)
			await deletePath(absolutePathToDelete)
		}
	}

	return true
})

export interface DeletePathsOptions {
	paths: string | string[]
}
