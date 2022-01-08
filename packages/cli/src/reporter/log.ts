import c from 'chalk'
import { emitter } from '@preset/core'
import { makeReporter } from '../types'
import { contexts, getParentContext } from '../state'
import { time, formatResult } from '../utils'

// eslint-disable-next-line no-console
const logToConsole = (...args: any[]) => console.log(' ', ...args)

// https://github.com/vitest-dev/vitest/blob/f2caced25fb0c5ac33368a8a64329467b796089e/packages/vitest/src/reporters/renderers/figures.ts
const format = {
	log: logToConsole,
	indent: (indent: number, ...args: any[]) => logToConsole('  '.repeat(indent), ...args),
	dim: (text: string)	=> c.gray(text),
	highlight: (text: string)	=> c.bold(`${text}`),
	fail: (text: string)	=> c.red.bold(text),
	success: (text: string)	=> c.green.bold(text),
	run: c.bgCyan.black(' RUN '),
	arrow: c.yellowBright.bold('→'),
	check: c.green.bold('√'),
	cross: c.red.bold('×'),
}

export const log = makeReporter({
	name: 'log',
	registerEvents: () => {
		format.log()

		emitter.on('preset:start', (context) => {
			contexts.push(context)

			if (context.count > 0) {
				format.indent(context.count, `${format.arrow} Applying nested preset: ${format.highlight(context.name)}...`)
			} else {
				format.log(`${format.run} ${format.dim(`Applying preset: ${format.highlight(context.name)}...`)}`)
				format.log()
			}
		})

		emitter.on('preset:end', (context) => {
			if (context.count === 0) {
				format.log()

				const actionsFailed = contexts.reduce((failed, { actions }) => failed += actions.reduce((failed, { status }) => failed += (status === 'failed' ? 1 : 0), 0), 0)
				const actionsSucceeded = contexts.reduce((succeeded, { actions }) => succeeded += actions.reduce((succeeded, { status }) => succeeded += (status === 'applied' ? 1 : 0), 0), 0)
				const presetsFailed = contexts.reduce((failed, { status }) => failed += (status === 'failed' ? 1 : 0), 0)
				const presetsSucceeded = contexts.reduce((failed, { status }) => failed += (status === 'applied' ? 1 : 0), 0)

				format.log(`Presets  ${formatResult({ count: presetsSucceeded, color: c.green.bold, text: 'applied' }, { count: presetsFailed, color: c.green.red, text: 'failed', excludeWhenEmpty: true })}`)
				format.log(`Actions  ${formatResult({ count: actionsSucceeded, color: c.green.bold, text: 'ran' }, { count: actionsFailed, color: c.green.red, text: 'failed', excludeWhenEmpty: true })}`)
				format.log(`   Time  ${time(context.start, context.end)}`)
				format.log()
			}
		})

		emitter.on('preset:fail', (context) => {
			if (context.count === 0) {
				format.indent(context.count, `${format.cross} ${format.dim(`Failed applying preset ${format.highlight(context.name)}`)}.`)
			}
		})

		emitter.on('preset:success', (context) => {
			format.indent(context.count, `${format.check} Applied preset ${format.highlight(context.name)}.`)
		})

		emitter.on('action:start', (context) => {
			const main = getParentContext(context)!

			format.indent(main.count, `${format.arrow} Running action: ${format.highlight(context.name)}...`)
		})

		emitter.on('action:fail', (context) => {
			const main = getParentContext(context)!

			if (main.count > 0) {
				format.indent(main.count, `${format.cross} ${format.dim(`Failed running action ${format.highlight(context.name)}`)}.`)
			}
		})
	},
})
