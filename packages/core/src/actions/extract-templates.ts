import path from 'node:path'
import nfs from 'node:fs'
import fs from 'fs-extra'
import fg from 'fast-glob'
import { defineAction } from '../api'
import { debug } from '../utils'

export interface ExtractTemplatesOptions {
	/**
	 * Defines the templates directory. Default is `templates`.
	 */
	templates?: string

	/**
	 * Sets the source file or directory.
	 */
	from?: string
	/**
	 * Sets the target file or directory.
	 */
	to?: string

	/**
	 * Ignore templates file structure. Only works when extracting from a file to a directory.
	 */
	flatten?: boolean

	/**
	 * Extract actual dotfiles in addition to `.dotfile` files.
	 */
	extractDotFiles?: boolean

	/**
	 * Defines whether to override existing files or skip extraction.
	 */
	whenConflict?: 'override' | 'skip'
}

const defaultOptions: Required<ExtractTemplatesOptions> = {
	templates: 'templates',
	from: '',
	to: '',
	whenConflict: 'override',
	flatten: false,
	extractDotFiles: false,
}

function renameDotfiles(input: string) {
	return input.replace(/^(.+[\/\\])*(.+\.dotfile)$/, (_, directory, dotfile) => path.resolve(`${directory}/.${dotfile.replace('.dotfile', '')}`))
}

const isFile = (input: string) => nfs.statSync(input, { throwIfNoEntry: false })?.isFile() ?? false
const isDirectory = (input: string) => nfs.statSync(input, { throwIfNoEntry: false })?.isDirectory() ?? false

export const extractTemplates = defineAction<ExtractTemplatesOptions, Required<ExtractTemplatesOptions>>(
	'extract-templates',
	async({ options, presetContext, actionContext }) => {
		const templatesPath = path.resolve(presetContext.localPreset.rootDirectory, options.templates, options.from)
		const targetPath = path.resolve(presetContext.applyOptions.targetDirectory, options.to)

		// Copying a directory to a file is kind of a dump operation
		if (isDirectory(templatesPath) && isFile(targetPath)) {
			throw new Error('Can not extract a directory to a file.')
		}

		// Copying a file to a directory means copying the file inside the directory
		if (isFile(templatesPath) && isDirectory(targetPath)) {
			const finalTargetPath = options.flatten
				? path.resolve(targetPath, path.basename(options.from))
				: path.resolve(targetPath, options.from)

			await copyFileToFile(templatesPath, finalTargetPath)

			return true
		}

		// If templatesPath is a file and targetPath is a file too
		if (isFile(templatesPath) && isFile(targetPath)) {
			await copyFileToFile(templatesPath, targetPath)

			return true
		}

		// If templatesPath is a directory and targetPath is a directory too
		if (isDirectory(templatesPath) && isDirectory(targetPath)) {
			await copyDirectoryToDirectory(templatesPath, targetPath)

			return true
		}

		// ---

		async function copyFileToFile(input: string, output: string) {
			output = renameDotfiles(output)

			if (await fs.pathExists(output) && options.whenConflict === 'skip') {
				debug.action(actionContext.name, `Skipped copying to ${output}.`)

				return
			}

			debug.action(actionContext.name, `Copying ${input} to ${output}.`)
			await fs.copy(input, output)
		}

		async function copyDirectoryToDirectory(input: string, output: string) {
			const paths = await fg('**/**', {
				ignore: ['node_modules', '.git', 'dist'],
				markDirectories: true,
				absolute: false,
				cwd: input,
				dot: options.extractDotFiles,
			})

			debug.action(actionContext.name, `Matched ${paths.length} paths:`, paths)

			// For each relative path, copy to the target path
			for (const relativePath of paths) {
				const resolvedInput = path.resolve(input, relativePath)
				const resolvedOutput = path.resolve(output, relativePath)

				await copyFileToFile(resolvedInput, resolvedOutput)
			}
		}

		return true
	},
	defaultOptions,
)
