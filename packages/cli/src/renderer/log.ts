import c from 'chalk'
import { emitter } from '@preset/core'
import { makeRenderer } from '../types'
import { getPresetState, markPresetFinished, registerPresetContext, state } from '../state'

// eslint-disable-next-line no-console
const log = (...args: any[]) => console.log(' ', ...args)

// https://github.com/vitest-dev/vitest/blob/f2caced25fb0c5ac33368a8a64329467b796089e/packages/vitest/src/reporters/renderers/figures.ts
const format = {
	log,
	indent: (indent: number, ...args: any[]) => log('  '.repeat(indent), ...args),
	dim: (text: string)	=> c.gray(text),
	highlight: (text: string)	=> c.bold(`${text}`),
	fail: (text: string)	=> c.red.bold(text),
	success: (text: string)	=> c.green.bold(text),
	run: c.bgCyan.black(' RUN '),
	arrow: c.yellowBright.bold('→'),
	check: c.green.bold('√'),
	cross: c.red.bold('×'),
}

export const logRenderer = makeRenderer({
	name: 'log',
	registerEvents: () => {
		format.log()

		emitter.on('preset:start', (context) => {
			registerPresetContext(context)

			if (context.count > 0) {
				format.indent(context.count, `${format.arrow} Applying nested preset: ${format.highlight(context.name)}...`)
			} else {
				format.log(`${format.run} ${format.dim(`Applying preset: ${format.highlight(context.name)}...`)}`)
				format.log()
			}
		})

		emitter.on('preset:end', (context) => {
			const preset = getPresetState(context)

			if (context.count === 0) {
				format.log()

				function formatResult(succeeded: number, failed: number) {
					let presetText = ''

					if (succeeded > 0) {
						presetText += format.success(`${succeeded} applied`)
					}

					if (succeeded && failed) {
						presetText += ' | '
					}

					if (failed > 0) {
						presetText += format.fail(`${failed} failed`)
					}

					presetText += ` ${format.dim(`(${failed + succeeded})`)}`

					return presetText
				}

				const time = (time: number) => {
					if (time > 1000) {
						return `${(time / 1000).toFixed(2)}s`
					}

					return `${Math.round(time)}ms`
				}

				const executionTime = preset.end - preset.start
				const actionsFailed = state.presets.reduce((failed, { actions }) => failed += actions.failed, 0)
				const actionsSucceeded = state.presets.reduce((succeeded, { actions }) => succeeded += actions.succeeded, 0)
				const presetsFailed = state.presets.reduce((failed, { state }) => failed += (state === 'failed' ? 1 : 0), 0)
				const presetsSucceeded = state.presets.reduce((failed, { state }) => failed += (state === 'applied' ? 1 : 0), 0)

				format.log(`Presets  ${formatResult(presetsSucceeded, presetsFailed)}`)
				format.log(`Actions  ${formatResult(actionsSucceeded, actionsFailed)}`)
				format.log(`   Time  ${time(executionTime)}`)
				format.log()
			}
		})

		emitter.on('preset:fail', (context) => {
			markPresetFinished(context, 'failed')

			if (context.count === 0) {
				format.indent(context.count, `${format.cross} ${format.dim(`Failed applying preset ${format.highlight(context.name)}`)}.`)
			}
		})

		emitter.on('preset:success', (context) => {
			markPresetFinished(context, 'applied')
			format.indent(context.count, `${format.check} Applied preset ${format.highlight(context.name)}.`)
		})

		emitter.on('action:start', (name, context) => {
			format.indent(context.count, `${format.arrow} Running action: ${format.highlight(name)}...`)

			getPresetState(context).actions.succeeded++
		})

		emitter.on('action:fail', (name, context) => {
			if (context.count > 0) {
				format.indent(context.count, `${format.cross} ${format.dim(`Failed running action ${format.highlight(name)}`)}.`)
			}

			getPresetState(context).actions.failed++
		})

		// emitter.on('action:success', (name, context) => {
		// 	format.indent(context.count, `${format.success} ${format.dim(`Finished action ${format.highlight(name)}`)}.`)
		// })
	},
})
