import path from 'node:path'
import fs from 'node:fs'
import fg from 'fast-glob'
import detectIndent from 'detect-indent'
import unset from 'unset-value'
import merge from 'deepmerge'
import type { JsonObject, Promisable } from 'type-fest'
import { defineAction } from '../api'
import { debug, objectWithoutKeys, wrap } from '../utils'

/**
 * Applies one or multiple operations to the given files.
 */
export const editFiles = defineAction<EditFilesOptions>('edit-files', async ({ options, presetContext, actionContext }) => {
	const paths = await fg(options.files, {
		ignore: ['node_modules', '.git', 'dist'],
		markDirectories: true,
		absolute: false,
		cwd: presetContext.applyOptions.targetDirectory,
		dot: true,
	})

	debug.action(actionContext.name, `Matched ${paths.length} paths:`, paths)

	// For each relative path, copy to the target path
	for (const relativePath of paths) {
		const targetFile = path.resolve(presetContext.applyOptions.targetDirectory, relativePath)

		// Reads the file
		let content = fs.readFileSync(targetFile, { encoding: 'utf-8' })

		// Loops through operations
		for (const operation of wrap(options.operations)) {
			debug.action(actionContext.name, 'Performing operation:', operation)

			// Skip the operation if necessary
			if (operation.skipIf && (await operation.skipIf(content, targetFile)) === true) {
				continue
			}

			// Updates the content of the file via a callback
			if (operation.type === 'update-content') {
				debug.action(actionContext.name, 'Updating file content via callback.')
				content = operation.update(content)
			}

			// Replaces the content with variables
			if (operation.type === 'replace-variables') {
				const prefix = operation.prefix ?? '@@'
				debug.action(actionContext.name, `Replacing given variables in file content, with prefix ${prefix}.`)

				for (let [variableName, variableValue] of Object.entries(operation.variables)) {
					variableName = variableName.startsWith(prefix)	? variableName : `${prefix}${variableName}`
					variableValue = typeof variableValue === 'function' ? variableValue(content)?.toString() : variableValue?.toString()
					content = content.replaceAll(variableName, variableValue ?? variableName)

					debug.action(actionContext.name, variableName, '->', variableValue)
				}
			}

			// Removes lines
			if (operation.type === 'remove-line') {
				debug.action(actionContext.name, `Removing line(s) on match ${operation.match}.`)

				const lines = content.replace(/\r\n/, '\n').split('\n')
				const index = lines.findIndex((value) => value.match(operation.match))

				if (index === -1) {
					debug.action(actionContext.name, `Could not find ${operation.match}, skipping.`)
					continue
				}

				// Removes lines from index
				const count = operation.count || 1
				const start = operation.start || 0

				debug.action(actionContext.name, `Using index ${index + start} and deleteCount ${count}`)
				lines.splice(index + start, count)

				content = lines.join('\n')
			}

			// Adds line
			if (operation.type === 'add-line') {
				const linesToAdd = wrap(operation.lines)
				debug.action(actionContext.name, `Adding ${linesToAdd.length} line(s)`)

				const lines = content.replace(/\r\n/, '\n').split('\n')
				const index = 'match' in operation ? lines.findIndex((value) => value.match(operation.match)) : -1

				if (index === -1 && 'match' in operation) {
					debug.action(actionContext.name, `Could not find ${operation.match}, skipping.`)
					continue
				}

				const indentLines = (targetLine: string, lines: string[]): string[] => {
					const operationIndent = operation.indent === undefined ? true : operation.indent

					// If true: will keep the indentation from the line before or after.
					if (operationIndent === true) {
						return lines.map((line) => detectIndent(targetLine).indent + line)
					}

					// If a number: will indent with the given amount of spaces.
					if (typeof operationIndent === 'number') {
						return lines.map((line) => ' '.repeat(operationIndent) + line)
					}

					// If a string: will use the given string as indentation.
					if (typeof operationIndent === 'string') {
						return lines.map((line) => operationIndent + line)
					}

					// If false or otherwise: will not indent.
					return lines
				}

				// Adds line to specified index
				if (typeof operation.position === 'number') {
					lines.splice(operation.position, 0, ...indentLines(lines[operation.position], linesToAdd))
					debug.action(actionContext.name, `Added ${linesToAdd.length} line(s) to specified index.`)
				}

				// Adds line to the start
				if (operation.position === 'prepend') {
					lines.splice(0, 0, ...linesToAdd)
					debug.action(actionContext.name, `Prepended ${linesToAdd.length} line(s).`)
				}

				// Adds line to the end
				if (operation.position === 'append') {
					lines.push(...linesToAdd)
					debug.action(actionContext.name, `Appended ${linesToAdd.length} line(s).`)
				}

				// Adds lines after the index
				if (operation.position === 'after') {
					lines.splice(index + 1, 0, ...indentLines(lines[index], linesToAdd))
					debug.action(actionContext.name, `Added ${linesToAdd.length} line(s) at index ${index}.`)
				}

				// Adds lines before the index
				if (operation.position === 'before') {
					lines.splice(index, 0, ...indentLines(lines[index], linesToAdd))
					debug.action(actionContext.name, `Added ${linesToAdd.length} line(s) at index ${index}.`)
				}

				content = lines.join('\n')
			}

			// Updates JSON
			if (operation.type === 'edit-json') {
				const { indent } = detectIndent(content)
				let json = JSON.parse(content)

				// Merge JSON
				if (operation.merge) {
					json = merge(json, operation.merge, {
						arrayMerge: (destinationArray: any[], sourceArray: any[]) => [...new Set(destinationArray.concat(sourceArray))],
					})
				}

				// Delete paths
				if (operation.delete) {
					const pathsToDelete = wrap(operation.delete)
					pathsToDelete.forEach((path) => unset(json, path))
				}

				// Replace JSON
				if (operation.replace) {
					json = operation.replace(json, objectWithoutKeys)
				}

				content = JSON.stringify(json, null, indent)
			}
		}

		// Writes back to file
		fs.writeFileSync(targetFile, content, { encoding: 'utf-8' })
	}

	return true
})

/*
|--------------------------------------------------------------------------
| Add line
|--------------------------------------------------------------------------
*/

interface AddLineOperation {
	type: 'add-line'

	/**
	 * The lines to add.
	 */
	lines: string | string[]

	/**
	 * Indentation for this line addition.
	 * If a number: will indent with the given amount of spaces.
	 * If a string: will use the given string as indentation.
	 * If true: will keep the indentation from the line before or after.
	 * If false: will not indent.
	 */
	indent?: number | string | boolean
}

type AddLineWithMatchOperation = AddLineOperation & {
	/**
	 * Whether to add the line before or after the matched line.
	 */
	position: 'after' | 'before'

	/**
	 * The line to match.
	 */
	match: RegExp
}

type AddLineAtOperation = AddLineOperation & {
	/**
	 * Whether to prepend or append the line.
	 */
	position: 'prepend' | 'append'
}

type AddLineAtIndexOperation = AddLineOperation & {
	/**
	 * The index to which add the line.
	 */
	position: number
}

/*
|--------------------------------------------------------------------------
| Remove line
|--------------------------------------------------------------------------
*/

interface RemoveLineOperation {
	type: 'remove-line'

	/**
	 * The line to match.
	 */
	match: RegExp

	/**
	 * The index to start removing lines from. Defaults to 0.
	 */
	start?: number

	/**
	 * The amount of lines to remove. Defaults to 1, can be negative to remove previous lines.
	 */
	count?: number
}

/*
|--------------------------------------------------------------------------
| Replace variables
|--------------------------------------------------------------------------
*/

interface ReplaceVariablesOperation {
	type: 'replace-variables'

	/**
	 * Variable prefix. Defaults to @@.
	 */
	prefix?: string

	/**
	 * An object which keys are variable names and values are variable content.
	 */
	variables: Record<string, string | number | ((content: string) => string | number)>
}

/*
|--------------------------------------------------------------------------
| Update content
|--------------------------------------------------------------------------
*/

interface UpdateContentOperation {
	type: 'update-content'

	/**
	 * Callback that takes the file content and must return the updated content.
	 */
	update: (content: string) => string
}

/*
|--------------------------------------------------------------------------
| Edit JSON
|--------------------------------------------------------------------------
*/

interface EditJsonOperation {
	type: 'edit-json'

	/**
	 * Merges the given JSON object.
	 */
	merge?: JsonObject

	/**
	 * Replaces the given JSON object.
	 * A helper is given to omit keys from the given JSON object.
	 */
	replace?: (current: any, omit: (object: any, ...keys: string[]) => any) => JsonObject

	/**
	 * Deletes the properties at the given paths. Paths may have dots.
	 */
	delete?: string | string[]
}

export type EditFileOperation = (AddLineAtIndexOperation | AddLineAtOperation | AddLineWithMatchOperation | RemoveLineOperation | ReplaceVariablesOperation | UpdateContentOperation | EditJsonOperation) & {
	/**
	 * Whether to skip that operation.
	 */
	skipIf?: (content: string, targetFile: string) => Promisable<boolean>
}

export interface EditFilesOptions {
	/**
	 * The files to edit. Can use a double-star glob.
	 */
	files: string | string[]

	/**
	 * List of operations to perform on the given file.
	 */
	operations: EditFileOperation | EditFileOperation[]
}
