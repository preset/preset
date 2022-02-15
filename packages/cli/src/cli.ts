#!/usr/bin/env node

/* eslint-disable no-console */
import path from 'node:path'
import c from 'chalk'
import createCli from 'cac'
import { applyPreset, PresetError } from '@preset/core'
import { version } from '../package.json'
import { patch } from './patch'
import { reporters } from './reporters'
import { invoke } from './utils'
import { checkLatestVersion, registerVersionMismatches } from './version'

invoke(async() => {
	registerVersionMismatches()
	checkLatestVersion()

	// Creates the base CLI
	const cli = createCli('preset')
		.option('--no-interaction', 'Disable interactions. Prompts will use their default answers.')
		.option('--debug', 'Use the debug reporter.')
		.option('--silent', 'Do not use a reporter.')
		.help()
		.version(version)

	// Registers the `apply` command
	cli.command('<resolvable> [target-directory]', 'Applies the given preset.')
		.alias('apply')
		.option('-p, --path [path]', 'The path to a sub-directory in which to look for a preset.')
		.option('-t, --tag [tag]', 'The branch or tag to use if the preset is a repository.')
		.option('--no-ssh', 'Whether to use SSH or not. This can be determined depending on the URL of the Git repository, defaulting to true when possible.')
		.option('--no-cache', 'Whether to use the cached repository if it exists.')
		.allowUnknownOptions()
		.action(async(resolvable: string, targetDirectory: string | undefined, parsedOptions) => await applyPreset({
			parsedOptions,
			resolvable,
			targetDirectory: targetDirectory ? path.resolve(targetDirectory) : process.cwd(),
			rawArguments: process.argv.slice(2),
		}))

	// Registers the `init` command
	cli.command('init [target-directory]', 'Initializes a new preset.')
		.alias('initialize')
		.option('--no-git', 'Do not initialize a Git repository.')
		.option('--no-install', 'Do not install the preset dependency.')
		.allowUnknownOptions()
		.action(async(targetDirectory: string | undefined, parsedOptions) => await applyPreset({
			parsedOptions,
			resolvable: path.resolve(__dirname, '../init'),
			targetDirectory: targetDirectory ?? process.cwd(),
			rawArguments: process.argv.slice(2),
		}))

	// Runs the CLI after registering the events
	const { options } = patch(cli).parse(process.argv, { run: false })

	if (process.env.CI || options.debug === true) {
		reporters.debug.registerEvents()
	} else if (!options.silent) {
		Reflect.get(reporters, options.reporter || 'list')?.registerEvents()
	}

	await cli.runMatchedCommand()
}, (error) => {
	if (error instanceof PresetError) {
		console.log()
		console.log(`${c.bgRed.white.bold(` ${error.code} `)} ${c.red(error.details ?? error.parent?.message)}`)
		console.log()
	} else {
		console.log()
		console.log(`${c.bgRed.white.bold(' ERROR ')} ${c.red(error.message)}`)
		console.log()
	}

	process.exit(1)
})
