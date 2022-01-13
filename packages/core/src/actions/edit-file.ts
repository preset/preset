import path from 'node:path'
import fs from 'node:fs'
import detectIndent from 'detect-indent'
import { defineAction } from '../api'
import { debug } from '../utils'

export const editFile = defineAction<EditFileOptions>('edit-file', async({ options, presetContext, actionContext }) => {
	const targetFile = path.resolve(presetContext.applyOptions.targetDirectory, options.file)
	const ignoreIfMissing = options.ignoreIfMissing === undefined ? true : Boolean(options.ignoreIfMissing)

	// Ensures the file exists first
	if (!fs.statSync(targetFile, { throwIfNoEntry: false })?.isFile()) {
		debug.action(actionContext.name, 'Specified file does not exists.')

		if (ignoreIfMissing) {
			return true
		}

		throw new Error(`File "${options.file} does not exist."`)
	}

	// Reads the file
	let content = fs.readFileSync(targetFile, { encoding: 'utf-8' })

	// Loops through operations
	for (const operation of options.operations) {
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
				variableName = variableName.startsWith(prefix) ? variableName : `${prefix}${variableName}`
				variableValue = typeof variableValue === 'function' ? variableValue(content).toString() : variableValue.toString()
				content = content.replaceAll(variableName, variableValue)

				debug.action(actionContext.name, variableName, '->', variableValue)
			}
		}

		// Removes lines
		if (operation.type === 'remove-line') {
			const count = operation.count === undefined ? 1 : operation.count
			debug.action(actionContext.name, `Removing ${count} line(s) ${operation.position} ${operation.match}.`)

			const lines = content.replace(/\r\n/, '\n').split('\n')
			const index = lines.findIndex((value) => value.match(operation.match))

			if (index === -1) {
				debug.action(actionContext.name, `Could not find ${operation.match}, skipping.`)
				continue
			}

			// Removes lines after the index
			if (operation.position === 'after') {
				lines.splice(index + 1, count)
				debug.action(actionContext.name, `Removed ${count} line(s) at index ${index}.`)
			}

			// Removes lines before the index
			if (operation.position === 'before') {
				const start = Math.max(0, index - count)
				const end = index - start
				lines.splice(start, end)
				debug.action(actionContext.name, `Removed ${start - end} line(s) at index ${index} (start: ${start}, end: ${end}).`)
			}

			content = lines.join('\n')
		}

		// Adds line
		if (operation.type === 'add-line') {
			const linesToAdd = Array.isArray(operation.lines) ? operation.lines : [operation.lines]
			debug.action(actionContext.name, `Adding ${linesToAdd.length} line(s) ${operation.position} ${operation.match}.`)

			const lines = content.replace(/\r\n/, '\n').split('\n')
			const index = lines.findIndex((value) => value.match(operation.match))

			if (index === -1) {
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
	}

	// Writes back to file
	fs.writeFileSync(targetFile, content, { encoding: 'utf-8' })

	return true
})

/**
 * Whether to add or remove the given line `after` or `before` the line that matches.
 */
 type Position = 'after' | 'before'

 /**
  * If a number: will indent with the given amount of spaces.
  * If a string: will use the given string as indentation.
  * If true: will keep the indentation from the line before or after.
  * If false: will not indent.
  */
 type Indent = number | string | boolean

interface AddLineOperation {
	type: 'add-line'

	/**
    * Whether to add the line before or after the matched line.
    */
	position: Position

	/**
    * The line to match.
    */
	match: RegExp
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
	indent?: Indent
}

interface RemoveLineOperation {
	type: 'remove-line'

	/**
    * Whether to remove the lines before or after the matched line.
    */
	position: Position

	/**
    * The line to match.
    */
	match: RegExp

	/**
    * Amount of lines to remove. Defaults to one.
    */
	count?: number
}

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

interface UpdateContentOperation {
	type: 'update-content'
	update: (content: string) => string
}

export type EditFileOperation = AddLineOperation | RemoveLineOperation | ReplaceVariablesOperation | UpdateContentOperation

export interface EditFileOptions {
	/**
    * The file to edit.
    */
	file: string

	/**
    * Skips the action if the specified file is missing. Defaults to true.
    */
	ignoreIfMissing?: boolean

	/**
    * List of operations to perform on the given file.
    */
	operations: EditFileOperation[]
}
