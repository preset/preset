import c from 'chalk'
import { disable } from 'debug'
import { emitter } from '@preset/core'
import type { Status, PresetContext } from '@preset/core'
import { createLogUpdate } from 'log-update'
import { makeReporter } from '../types'
import { contexts } from '../state'
import { formatResult, time } from '../utils'

// https://github.com/vitest-dev/vitest/blob/f2caced25fb0c5ac33368a8a64329467b796089e/packages/vitest/src/reporters/renderers/figures.ts
const format = {
	indent: (indent: number) => `${'  '.repeat(indent)}  `,
	dim: (text?: any)	=> c.gray(text),
	highlight: (text?: any)	=> c.bold(`${text}`),
	titleWorking: (text?: any)	=> c.bgYellowBright.black.bold(`${text}`),
	titleFail: (text?: any)	=> c.bgRed.bold(`${text}`),
	titleSuccess: (text?: any)	=> c.bgGreen.bold(`${text}`),
}

const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

export const list = makeReporter({
	name: 'list',
	registerEvents: () => {
		disable()

		const updateLog = createLogUpdate(process.stdout)
		const timer = setInterval(() => render(), 150)
		let index = 0

		// Might need a lil cleanup
		function render() {
			let text: string = ''
			index = ++index % spinner.length

			const symbol: Record<Status, string> = {
				applying: c.yellowBright.bold(spinner[index]),
				applied: c.green.bold('√'),
				failed: c.red.bold('×'),
			}

			// The main preset is specially formatted
			const main = contexts.at(0)!
			text += '\n\n'
			text += {
				applying: ` ${format.titleWorking(' RUN ')} ${format.dim(`Applying preset: ${format.highlight(main.name)}...`)}`,
				applied: ` ${format.titleSuccess(' OK ')} ${c.green(`Applied preset: ${format.highlight(main.name)}.`)}`,
				failed: ` ${format.titleFail(' ERR ')} ${c.red(`Failed applying: ${format.highlight(main.name)}.`)}`,
			}[main.status]
			text += '\n\n'

			function renderPresetActions(preset?: PresetContext) {
				if (!preset) {
					return
				}

				// Render actions
				preset.actions.forEach((action) => {
					text += format.indent(preset.count)
					text += symbol[action.status]
					text += ` ${{ applying: 'Running', applied: 'Ran', failed: 'Failed' }[action.status]} `

					if (action.options.title) {
						text += format.highlight(action.options.title)
					} else {
						text += `action: ${format.highlight(action.name)}`
					}

					// Depending on action, print additional logging
					switch (action.name) {
						// Nested preset have their own actions
						case 'apply-nested-preset': {
							const nestedPresetContext = contexts.find(({ applyOptions }) => applyOptions.actionContextId === action.id)

							if (nestedPresetContext) {
								text += format.dim(` (preset: ${format.highlight(nestedPresetContext?.name)}`)

								if (nestedPresetContext?.error) {
									text += `${format.dim(',')} ${c.red(`error: ${(nestedPresetContext.error.message)}`)}`
								}

								text += format.dim(')\n')
							}

							renderPresetActions(nestedPresetContext)

							break
						}

						default:
							if (action.error) {
								text += c.red(` (error: ${format.highlight(action.error.message)})`)
							}

							text += '\n'
					}
				})
			}

			// Render presets
			renderPresetActions(main)

			// Display stat results
			if (contexts[0].status !== 'applying') {
				const actionsFailed = contexts.reduce((failed, { actions }) => failed += actions.reduce((failed, { status }) => failed += (status === 'failed' ? 1 : 0), 0), 0)
				const actionsSucceeded = contexts.reduce((succeeded, { actions }) => succeeded += actions.reduce((succeeded, { status }) => succeeded += (status === 'applied' ? 1 : 0), 0), 0)
				const presetsFailed = contexts.reduce((failed, { status }) => failed += (status === 'failed' ? 1 : 0), 0)
				const presetsSucceeded = contexts.reduce((failed, { status }) => failed += (status === 'applied' ? 1 : 0), 0)

				text += '\n'
				text += `  Presets  ${formatResult({ count: presetsSucceeded, color: c.green.bold, text: 'applied' }, { count: presetsFailed, color: c.green.red, text: 'failed' })} \n`
				text += `  Actions  ${formatResult({ count: actionsSucceeded, color: c.green.bold, text: 'ran' }, { count: actionsFailed, color: c.green.red, text: 'failed' })} \n`
				text += `     Time  ${time(contexts[0].start, contexts[0].end)}`
				text += '\n\n'
			}

			updateLog(text)
		}

		emitter.on('preset:start', (context) => {
			contexts.push(context)
			render()
		})

		emitter.on('preset:end', (context) => {
			if (context.count === 0) {
				setTimeout(() => {
					render()
					clearInterval(timer)
				}, 1)
			}
		})
	},
})
