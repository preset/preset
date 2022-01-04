#!/bin/env node
/* eslint-disable no-console */
import path from 'path'
import createCli from 'cac'
import { applyPreset } from '@preset/core'
import { version } from '../package.json'
import { patch } from './patch'
import { listRenderer, logRenderer, debugRenderer, nullRenderer } from './renderer'

export const renderers = {
	list: listRenderer,
	log: logRenderer,
	debug: debugRenderer,
	null: nullRenderer,
}

// Creates the base CLI
const cli = createCli('preset')
	.option('--no-interaction', 'Disable interactions.')
	.option('--renderer <name>', 'Chose the verbosity.', { default: 'log' })
	.help()
	.version(version)

// Registers the `apply` command
cli.command('apply <resolvable> [target-directory]', 'Applies the given preset.')
	.option('-p, --path [path]', 'The path to a sub-directory in which to look for a preset.')
	.option('-t, --tag [tag]', 'The branch or tag to use if the preset is a repository.')
	.option('-ssh', 'Whether to use SSH or not. This can be determined depending on the URL of the Git repository, defaulting to true when possible.')
	.option('--no-cache', 'Whether to use the cached repository if it exists.')
	.action(async(resolvable: string, targetDirectory: string | undefined, commandLine) => {
		// console.log(`Applying ${resolvable} in ${targetDirectory ?? process.cwd()} with ${JSON.stringify(commandLine)}`)
		await applyPreset({
			resolvable,
			targetDirectory: targetDirectory ?? process.cwd(),
			commandLine,
			args: process.argv.slice(0, 2),
		})
	})

// Registers the `init` command
cli.command('init [target-directory]', 'Initializes a new preset.')
	.alias('initialize')
	.option('--no-git', 'Do not initialize a Git repository.')
	.action(async(targetDirectory: string | undefined, commandLine) => {
		// console.log(`Initializing a preset in ${targetDirectory ?? process.cwd()} with ${commandLine}`)
		await applyPreset({
			resolvable: path.resolve(__dirname, '../../init'),
			targetDirectory: targetDirectory ?? process.cwd(),
			commandLine,
			args: process.argv.slice(0, 2),
		})
	})

// Runs the CLI after registering the events
try {
	const { options } = patch(cli).parse()
	Reflect.get(renderers, options.renderer).registerEvents()
} catch (error: any) {
	console.log(`${error.message}`)
}
