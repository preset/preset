#!/bin/env node
/* eslint-disable no-console */
import path from 'pathe'
import c from 'chalk'
import createCli from 'cac'
import { applyPreset } from '@preset/core'
import { version } from '../package.json'
import { patch } from './patch'
import { list, log, debug, _null } from './reporter'

export const reporters = {
	list,
	log,
	debug,
	null: _null,
}

// Creates the base CLI
const cli = createCli('preset')
	.option('--no-interaction', 'Disable interactions.')
	.option('--reporter <name>', 'Which reporter to log to..', { default: 'list' })
	.help()
	.version(version)

// Registers the `apply` command
cli.command('apply <resolvable> [target-directory]', 'Applies the given preset.')
	.option('-p, --path [path]', 'The path to a sub-directory in which to look for a preset.')
	.option('-t, --tag [tag]', 'The branch or tag to use if the preset is a repository.')
	.option('-ssh', 'Whether to use SSH or not. This can be determined depending on the URL of the Git repository, defaulting to true when possible.')
	.option('--no-cache', 'Whether to use the cached repository if it exists.')
	.action((resolvable: string, targetDirectory: string | undefined, commandLine) => applyPreset({
		commandLine,
		resolvable,
		targetDirectory: targetDirectory ?? process.cwd(),
		args: process.argv.slice(0, 2),
	}))

// Registers the `init` command
cli.command('init [target-directory]', 'Initializes a new preset.')
	.alias('initialize')
	.option('--no-git', 'Do not initialize a Git repository.')
	.action((targetDirectory: string | undefined, commandLine) => applyPreset({
		commandLine,
		resolvable: path.resolve(__dirname, '../../init'),
		targetDirectory: targetDirectory ?? process.cwd(),
		args: process.argv.slice(0, 2),
	}))

// Runs the CLI after registering the events
try {
	const { options } = patch(cli).parse()

	Reflect.get(reporters, options.reporter)?.registerEvents()
} catch (error: any) {
	console.log()
	console.log(`${c.bgRed.white.bold(' ERROR ')} ${c.red(error.message)}`)

	if (!error.toString().includes('CACError')) {
		console.log(c.gray((error as Error)?.stack ?? ''))
	}

	console.log()
}
