import c from 'chalk'
import { emitter } from '@preset/core'
import type { Status } from '@preset/core'
import { createLogUpdate } from 'log-update'
import { makeRenderer } from '../types'
import { contexts } from '../state'

// https://github.com/vitest-dev/vitest/blob/f2caced25fb0c5ac33368a8a64329467b796089e/packages/vitest/src/reporters/renderers/figures.ts
const format = {
	indent: (indent: number) => '  '.repeat(indent),
	dim: (text: string)	=> c.gray(text),
	highlight: (text: string)	=> c.bold(`${text}`),
	fail: (text: string)	=> c.red.bold(text),
	success: (text: string)	=> c.green.bold(text),
	run: c.bgCyan.black(' RUN '),
}

const symbol: Record<Status, string> = {
	applying: c.yellowBright.bold('→'),
	applied: c.green.bold('√'),
	failed: c.red.bold('×'),
}

export const listRenderer = makeRenderer({
	name: 'list',
	registerEvents: () => {
		const updateLog = createLogUpdate(process.stdout)

		function render() {
			let text: string = ''

			// RUN preset
			// some action
			// preset action
			//   action
			//   action

			contexts.forEach((context, i) => {
				if (i === 0) {
					text += '\n'
					text += `${format.run} ${format.dim(`Applying preset: ${format.highlight(context.name)}...`)}`
					text += '\n\n'
				}

				text += format.indent(context.count)
				text += symbol[context.status]
			})

			updateLog(text)
		}

		// --

		emitter.on('preset:end', (context) => {
			render()
		})

		emitter.on('preset:fail', (context) => {
			render()
		})

		emitter.on('preset:success', (context) => {
			render()
		})

		emitter.on('action:start', (name, context) => {
			contexts.push(context)
			render()
		})

		emitter.on('action:fail', (name, context) => {
			render()
		})

		emitter.on('action:success', (name, context) => {
			render()
		})
	},
})
