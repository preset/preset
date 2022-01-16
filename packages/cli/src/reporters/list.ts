import * as readline from 'node:readline'
import c from 'chalk'
import debug from 'debug'
import { emitter } from '@preset/core'
import type { Status, PresetContext, PromptInput } from '@preset/core'
import { createLogUpdate } from 'log-update'
import { makeReporter } from '../types'
import { contexts } from '../state'
import { formatResult, time } from '../utils'

// https://github.com/vitest-dev/vitest/blob/f2caced25fb0c5ac33368a8a64329467b796089e/packages/vitest/src/reporters/renderers/figures.ts
const format = {
	indent: (indent: number) => `${'  '.repeat(indent)}  `,
	dim: (text?: any)	=> c.gray(text),
	highlight: (text?: any)	=> c.bold(`${text}`),
	titleWorking: (text?: any)	=> c.bgYellowBright.white.bold(`${text}`),
	titleFail: (text?: any)	=> c.bgRed.white.bold(`${text}`),
	titleSuccess: (text?: any)	=> c.bgGreen.white.bold(`${text}`),
	titleNextSteps: (text?: any)	=> c.bgMagenta.white.bold(`${text}`),
}

const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

export default makeReporter({
	name: 'list',
	registerEvents: () => {
		debug.disable()

		const inputs: Array<PromptInput & { response: string }> = []
		const updateLog = createLogUpdate(process.stdout)
		let rl: readline.Interface
		let timer: NodeJS.Timer
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
			text += '\n'
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
				preset.actions
					.filter((action) => !action.groupContextId)
					.forEach((action) => {
						text += format.indent(preset.count)
						text += symbol[action.status]
						text += ` ${{ applying: 'Running', applied: 'Ran', failed: 'Failed' }[action.status]} action: `
						text += format.highlight(c.white(action.options.title || action.name))

						// Nested presets
						if (action.name === 'apply-nested-preset') {
							const nestedPresetContext = contexts.find(({ applyOptions }) => applyOptions.actionContextId === action.id)

							if (nestedPresetContext) {
								text += format.dim(` (preset: ${format.highlight(nestedPresetContext?.name)})`)

								if (nestedPresetContext?.error) {
									nestedPresetContext.error.message.split('\n').forEach((line, index) => {
										text += '\n'
										text += format.indent(preset.count + 1)
										text += c.red(`${index === 0 ? '↳' : ' '} ${line}`)
									})
								}
							}

							renderPresetActions(nestedPresetContext)
						}

						// Install packages
						if (action.name === 'install-packages') {
							text += format.dim(` (${format.highlight(action.options.for)})`)
						}

						// Display child action logs if there are.
						if (action.name === 'group') {
							const logs = preset.actions
								.filter((child) => child.groupContextId === action.id && child.status === 'applying')
								.flatMap((action) => action.log)

							if (logs.length > 0 && action.status === 'applying') {
								text += '\n'
								text += format.indent(preset.count + 1)
								text += format.dim(`↳ ${logs.at(-1) ?? '...'}`)
							}

						}
						// Display prompts
						if (action.name === 'prompt') {
							const input = inputs.find((input) => input.actionContextId === action.id)
							text += '\n'
							text += format.indent(preset.count + 1)
							text += format.dim(`↳ ${format.dim(action.options.text)} `)
							text += c.gray.bold(input?.response.trim() || action.options.default)
						}

						// Display logs if there are.
						if (action.log.length > 0 && action.status === 'applying') {
							text += '\n'
							text += format.indent(preset.count + 1)
							text += format.dim(`↳ ${action.log.at(-1) ?? '...'}`)
						}

						// Display errors if there are, except for nested presets which display its own errors.
						if (action.error && action.name !== 'apply-nested-preset') {
							action.error.message.split('\n').forEach((line, index) => {
								text += '\n'
								text += format.indent(preset.count + 1)
								text += c.red(`${index === 0 ? '↳' : ' '} ${line}`)
							})
						}

						text += '\n'
					})
			}

			// Renders presets
			renderPresetActions(main)

			// Displays stat results
			if (contexts[0].status !== 'applying') {
				const actionsFailed = contexts.reduce((failed, { actions }) => failed += actions.reduce((failed, { status }) => failed += (status === 'failed' ? 1 : 0), 0), 0)
				const actionsSucceeded = contexts.reduce((succeeded, { actions }) => succeeded += actions.reduce((succeeded, { status }) => succeeded += (status === 'applied' ? 1 : 0), 0), 0)
				const presetsFailed = contexts.reduce((failed, { status }) => failed += (status === 'failed' ? 1 : 0), 0)
				const presetsSucceeded = contexts.reduce((failed, { status }) => failed += (status === 'applied' ? 1 : 0), 0)

				text += '\n'
				text += `  Presets  ${formatResult({ count: presetsSucceeded, color: c.green.bold, text: 'applied' }, { count: presetsFailed, color: c.green.red, text: 'failed', excludeWhenEmpty: true })} \n`
				text += `  Actions  ${formatResult({ count: actionsSucceeded, color: c.green.bold, text: 'ran' }, { count: actionsFailed, color: c.green.red, text: 'failed', excludeWhenEmpty: true })} \n`
				text += `     Time  ${time(contexts[0].start, contexts[0].end)}`
				text += '\n'

				// Displays post-install messages
				const hl = (text: string) => c.magenta(text)
				const b = (text: string) => c.bold(text)
				const postInstall = typeof contexts[0].preset.postInstall === 'function'
					? contexts[0].preset.postInstall({ context: contexts[0], hl, b })
					: contexts[0].preset.postInstall

				// Display errors
				if (main.status === 'failed') {
					text += '\n\n'
					text += ` ${format.titleFail(' ERR ')} ${c.red(main.error?.message ?? 'An unknown error occured.')}`
					text += '\n'
				} else if (postInstall) {
					text += '\n\n'
					text += ` ${format.titleNextSteps(' NEXT STEPS ')}`
					text += '\n\n'
					text += postInstall.map((msg) => `  ${c.magentaBright('➜')}  ${msg}`).join('\n')
					text += '\n'
				}
			}

			updateLog(text)
		}

		emitter.on('prompt:input', async(promptInput) => {
			inputs.push({ ...promptInput, response: '' })

			const onInput = () => {
				const input = inputs.at(-1)!
				let chunk

				// 8 backspace
				// 3 ctrl+c
				// 13 enter

				// eslint-disable-next-line no-cond-assign
				while ((chunk = process.stdin.read()) !== null) {
					// Handle backspace (8)
					if (Buffer.from(chunk).toString().charCodeAt(0) === 8) {
						input.response = input.response.slice(0, -1)
						continue
					}

					// Add the chunk
					input.response += chunk
				}

				// Deactive typing when enter is pressed
				if (input.response.endsWith('\r') || input.response.endsWith(String.fromCharCode(3))) {
					input.response = input.response.slice(0, -1)

					process.stdin.off('readable', onInput)
					process.stdin.setRawMode(false)

					emitter.emit('prompt:response', {
						id: input.id,
						response: input.response,
					})
				}
			}

			// Activates typing
			process.stdin.on('readable', onInput)
			process.stdin.setRawMode(true)
		})

		emitter.on('preset:start', (context) => {
			contexts.push(context)
			render()

			if (context.count === 0) {
				context.applyOptions.parsedOptions.interaction = context.applyOptions.parsedOptions.interaction === undefined
					? true
					: context.applyOptions.parsedOptions.interaction

				if (timer) {
					clearInterval(timer)
				}

				rl = readline.createInterface({ input: process.stdin })
				timer = setInterval(() => render(), 150)
			}
		})

		emitter.on('preset:end', (context) => {
			if (context.count === 0) {
				setTimeout(() => {
					render()
					clearInterval(timer)
					rl?.close()
				}, 1)
			}
		})
	},
})
