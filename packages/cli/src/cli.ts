#!/bin/env node
import { resolvePreset } from '@preset/core'

async function load(filepath: string) {
	console.log(await resolvePreset({
		args: process.argv.slice(3),
		resolvable: filepath,
		targetDirectory: '.',
		commandLine: {
			cache: false,
		},
	}))
}

load(process.argv[2])
