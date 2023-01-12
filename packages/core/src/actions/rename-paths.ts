import path from 'node:path'
import nfs from 'node:fs'
import fs from 'fs-extra'
import fg from 'fast-glob'
import { defineAction } from '../api'
import { debug } from '../utils'

const isFile = (input: string) => nfs.statSync(input, { throwIfNoEntry: false })?.isFile() ?? false

/**
 * Renames the given folders or files from the target directory.
 */
export const renamePaths = defineAction<RenamePathsOptions>('rename-paths', async({ options, actionContext, presetContext }) => {
	const { transformer, paths } = options

	const globPaths = await fg(paths || '**/**', {
		ignore: ['node_modules', '.git', 'dist'],
		absolute: false,
		cwd: presetContext.applyOptions.targetDirectory,
		dot: true,
		onlyFiles: false,
	})

	debug.action(actionContext.name, `Matched ${paths.length} paths:`, paths)

	const renamePath = async(oldPath: string, newPath: string) => {
		debug.action(actionContext.name, `Renaming path "${oldPath}" to "${newPath}".`)

		return await fs.rename(oldPath, newPath)
	}

	const getParsedPath = (pathOrGlob: string, absolutePathToRename: string): ParsedPath => {
		const ext = path.extname(pathOrGlob)
		const pathIsFile = isFile(absolutePathToRename)

		return {
			// Extract the file or directory name from a file path (if file without extension)
			name: path.basename(pathOrGlob, pathIsFile ? ext : ''),
			// Extract the file or directory name from a file path (if file with extension)
			base: path.basename(pathOrGlob),
			// If file extract the extension from a file path
			...(pathIsFile && { ext }),
		}
	}

	for (const pathOrGlobToRename of globPaths) {
		const absolutePathToRename = path.resolve(
			presetContext.applyOptions.targetDirectory,
			pathOrGlobToRename,
		)

		// Extract the directory name from a file path
		const baseDir = path.dirname(pathOrGlobToRename)
		const parsedPath = getParsedPath(pathOrGlobToRename, absolutePathToRename)

		const absoluteRenamedPath = path.resolve(
			presetContext.applyOptions.targetDirectory,
			baseDir,
			typeof transformer === 'function' ? transformer(parsedPath) : transformer,
		)
		await renamePath(absolutePathToRename, absoluteRenamedPath)
	}

	return true
})

interface ParsedPath {
	/**
	 * The file or directory name (including the file extension).
	 */
	name: string
	/**
	 * The file or directory name (without the file extension).
	 */
	base: string
	/**
	 * If a file, the file extension.
	 */
	ext?: string
}

export interface RenamePathsOptions {
	/**
	 * The files or folders to rename. Can use a double-star glob.
	 */
	paths: string | string[]

	/**
	 * Transformer can be a `string` or `function()`, which returns the filename.
	 */
	transformer: string | ((parameters: ParsedPath) => string)
}
