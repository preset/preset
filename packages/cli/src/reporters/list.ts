import * as readline from 'node:readline'
import c from 'chalk'
import debug from 'debug'
import { beep, cursor } from 'sisteransi'
import { emitter, PromptSelect } from '@preset/core'
import type { Status, PresetContext, PromptInput } from '@preset/core'
import { createLogUpdate } from 'log-update'
import { makeReporter } from '../types'
import { contexts } from '../state'
import { formatResult, time } from '../utils'
import { checks } from '../version'

// https://github.com/vitest-dev/vitest/blob/f2caced25fb0c5ac33368a8a64329467b796089e/packages/vitest/src/reporters/renderers/figures.ts
const format = {
	indent: (indent: number) => `${'  '.repeat(indent)}  `,
	dim: (text?: any)	=> c.gray(text),
	highlight: (text?: any)	=> c.bold(`${text}`),
	titleWorking: (text?: any)	=> c.bgYellowBright.white.bold(`${text}`),
	titleFail: (text?: any)	=> c.bgRed.white.bold(`${text}`),
	titleSuccess: (text?: any)	=> c.bgGreen.white.bold(`${text}`),
	titleNextSteps: (text?: any)	=> c.bgMagenta.white.bold(`${text}`),
	titleWarning: (text?: any)	=> c.bgYellow.white.bold(`${text}`),
}

const action = (key, isSelect) => {
	if (key.meta && key.name !== 'escape') return

	if (key.ctrl) {
		if (key.name === 'a') return 'first'
		if (key.name === 'c') return 'abort'
		if (key.name === 'd') return 'abort'
		if (key.name === 'e') return 'last'
		if (key.name === 'g') return 'reset'
	}

	if (isSelect) {
		if (key.name === 'j') return 'down'
		if (key.name === 'k') return 'up'
	}

	if (key.name === 'return') return 'submit'
	if (key.name === 'enter') return 'submit' // ctrl + J
	if (key.name === 'backspace') return 'delete'
	if (key.name === 'delete') return 'deleteForward'
	if (key.name === 'abort') return 'abort'
	if (key.name === 'escape') return 'exit'
	if (key.name === 'tab') return 'next'
	if (key.name === 'pagedown') return 'nextPage'
	if (key.name === 'pageup') return 'prevPage'
	// TODO create home() in prompt types (e.g. TextPrompt)
	if (key.name === 'home') return 'home'
	// TODO create end() in prompt types (e.g. TextPrompt)
	if (key.name === 'end') return 'end'

	if (key.name === 'up') return 'up'
	if (key.name === 'down') return 'down'
	if (key.name === 'right') return 'right'
	if (key.name === 'left') return 'left'

	return false
}

const symbols = {
	spinner: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
	arrow: '➜',
	arrowUp: '↑',
	arrowDown: '↓',
	arrowLeft: '←',
	arrowRight: '→',
	check: '✓',
	cross: '×',
	subArrow: ' ↪ ',
	ellipsis: '…',
	pointer: '❯',
	pointerDouble: '»',
	pointerSmall: '›',
}

export default makeReporter({
	name: 'list',
	registerEvents: () => {
		debug.disable()
		const inputs: Array<(PromptInput | PromptSelect) & { response: string, cursor?: number, isDone?: boolean }> = []
		const updateLog = createLogUpdate(process.stdout)
		const failedPresets: Set<string> = new Set([])
		let rl: readline.Interface
		let timer: NodeJS.Timer
		let index = 0

		function renderInputPrompt (preset, action, input) {
			let text = '\n'
			text += format.indent(preset.count + 1)
			text += format.dim(`${symbols.subArrow} ${format.dim(action.options.text)} `)
			text += c.gray.bold(input?.response.trim() || action.options.default)
			return text
		}

		function entriesToDisplay (cursor, total, maxVisible) {
			maxVisible = maxVisible || total

			let startIndex = Math.min(total - maxVisible, cursor - Math.floor(maxVisible / 2))
			if (startIndex < 0) startIndex = 0
			const endIndex = Math.min(startIndex + maxVisible, total)

			return { startIndex, endIndex }
		}

		function renderChoices (preset, input) {
			let outputText = '\n';

			const { startIndex, endIndex } = entriesToDisplay(
				input?.cursor,
				input?.choices.length,
				input?.optionsPerPage
			)

			const getChoicePrefix = (idx, startIdx, endIdx, numChoices, selectedIdx) => {
				let prefix = ' '

				if (idx === startIdx && startIdx > 0) {
					prefix = symbols.arrowUp
				} else if (idx === endIdx - 1 && endIdx < numChoices) {
					prefix = symbols.arrowDown
				}

				return format.indent(preset.count + 2) + (selectedIdx === idx ? c.cyan(symbols.pointerDouble) + '' : ' ') + prefix
			}

			for (let i = startIndex; i < endIndex; i++) {
				const choice = input.choices[i]
				const choiceTitle = choice.title || choice

				const title = input.cursor === i ? c.cyan.underline(choiceTitle) : choiceTitle;
				const prefix = getChoicePrefix(i, startIndex, endIndex, input.choices.length, input.cursor)

				outputText += `${prefix} ${title}\n`;
			}

			return outputText
		}

		function renderSelectPrompt (preset, action, input) {
			const isDone = input.isDone
			const hasHint = Boolean(action.options.text)

			const outputText = [
				isDone ? symbols.pointerSmall : hasHint ? c.bold.gray(symbols.pointerSmall) : '',
				isDone ? input.response.trim() : hasHint ? c.bold.gray(action.options.text) : ''
			].join(' ');

			return ` ${isDone ? outputText : outputText + renderChoices(preset, input)}`
		}

		function renderPrompt (preset, action, inputs) {
			const input = inputs.find((input) => input.actionContextId === action.id)
			return input.isSelect ? renderSelectPrompt(preset, action, input) : renderInputPrompt(preset, action, input)
		}

		// Might need a lil cleanup
		function render() {
			let text: string = ''
			index = ++index % symbols.spinner.length

			const symbol: Record<Status, string> = {
				applying: c.yellowBright.bold(symbols.spinner[index]),
				applied: c.green.bold(symbols.check),
				failed: c.red.bold(symbols.cross),
			}

			const main = contexts.at(0)!

			// Displays update messages
			if (checks.versionMismatches.length || checks.updates) {
				const updateAvailable = checks.updates && checks.updates.latest !== checks.updates.current

				text += '\n'
				text += ` ${format.titleWarning(updateAvailable ? ' UPDATE AVAILABLE ' : ' VERSION MISMATCH ')}`
				text += '\n\n'

				// Displays if an update is available or the current version
				if (updateAvailable) {
					text += `  ${c.greenBright(symbols.arrow)}  Latest version: ${c.bold.greenBright(`v${checks.updates!.latest}`)}\n`
					text += `  ${c.redBright(symbols.arrow)}  Current version: ${c.bold.redBright(`v${checks.updates!.current}`)}\n`
				} else {
					text += `  ${c.greenBright(symbols.arrow)}  Current version: ${c.bold.greenBright(`v${checks.current}`)} ${c.gray('(latest)')}\n`
				}

				// Displays each version mismatch
				checks.versionMismatches.forEach((mismatch) => {
					const name = contexts.find((preset) => mismatch.presetFile === preset.localPreset.presetFile)?.name

					if (name) {
						text += `  ${c.redBright(symbols.arrow)}  Preset ${c.magenta(name)} requires ${c.bold.redBright(mismatch.presetVersion)} ${mismatch.isOutdated ? c.gray('(outdated, may not work)') : ''}\n`
					}
				})

				// Displays the update command
				if (updateAvailable) {
					text += `  ${c.greenBright(symbols.arrow)}  ${c.bold(`Use ${c.magenta.bold('npm i -g @preset/cli')} to update.`)}\n`
				}
				text += '\n'
			}

			// The main preset is specially formatted
			text += '\n'
			text += {
				applying: ` ${format.titleWorking(' RUN ')} ${format.dim(`Applying ${format.highlight(main.name)}...`)}`,
				applied: ` ${format.titleSuccess(' OK ')} ${c.green(`Applied ${format.highlight(main.name)}.`)}`,
				failed: ` ${format.titleFail(' ERROR ')} ${c.red(`Failed applying ${format.highlight(main.name)}.`)}`,
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
						text += `  ${{ applying: 'Executing', applied: 'Executed', failed: 'Failed' }[action.status]} action: `
						text += format.highlight(c.white(action.options.title || action.name))

						/*
						|--------------------------------------------------------------------------
						| Inline
						|--------------------------------------------------------------------------
						*/

						// Nested presets
						if (action.name === 'apply-nested-preset') {
							const nestedPresetContext = contexts.find(({ applyOptions }) => applyOptions.actionContextId === action.id)

							if (nestedPresetContext) {
								text += format.dim(` (preset: ${format.highlight(nestedPresetContext?.name)})`)

								if (nestedPresetContext?.error) {
									nestedPresetContext.error.message.split('\n').forEach((line, index) => {
										text += '\n'
										text += format.indent(preset.count + 1)
										text += c.red(`${index === 0 ? symbols.subArrow : ' '} ${line}`)
									})
								}

								text += '\n'
							}

							renderPresetActions(nestedPresetContext)
						}

						// Install packages
						if (action.name === 'install-packages') {
							text += format.dim(` (${format.highlight(action.options.for)})`)
						}

						// Duration
						if (action.end && preset.options.time) {
							text += format.dim(`  (${time(action.start, action.end)})`)
						}

						/*
						|--------------------------------------------------------------------------
						| New line
						|--------------------------------------------------------------------------
						*/

						// Display child action logs if there are.
						if (action.name === 'group') {
							const children = preset.actions.filter((child) => child.groupContextId === action.id)
							const failed = children.filter((child) => child.status === 'failed')
							const logs = children
								.filter((child) => child.status === 'applying')
								.flatMap((action) => action.log)

							if (children.length > 1) {
								text += format.dim(` (${children.length} actions)`)
							}

							if (logs.length > 0 && action.status === 'applying') {
								text += '\n'
								text += format.indent(preset.count + 1)
								text += format.dim(`${symbols.subArrow} ${logs.at(-1) ?? '...'}`)
							}

							if (failed.length) {
								failed.forEach((failedChild) => {
									if (failedChild?.error) {
										failedChild.error.message.split('\n').forEach((line, index) => {
											text += '\n'
											text += format.indent(preset.count + 1)
											text += c.red(`${index === 0 ? symbols.subArrow : ' '} ${line}`)
										})
									}
								})
							}
						}

						// Display prompts
						if (action.name === 'prompt') {
							text += renderPrompt(preset, action, inputs)
						}

						// Display logs if there are.
						if (action.log.length > 0 && action.status === 'applying') {
							text += '\n'
							text += format.indent(preset.count + 1)
							text += format.dim(`${symbols.subArrow} ${action.log.at(-1) ?? '...'}`)
						}

						// Display errors if there are, except for nested presets which display its own errors.
						if (action.error && action.name !== 'apply-nested-preset') {
							action.error.message.split('\n').forEach((line, index) => {
								text += '\n'
								text += format.indent(preset.count + 1)
								text += c.red(`${index === 0 ? symbols.subArrow : ' '} ${line}`)
							})
						}

						if (action.name !== 'apply-nested-preset') {
							text += '\n'
						}
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
				text += ` ${c.gray('Presets')}  ${formatResult({
					count: presetsSucceeded,
					color: c.green.bold,
					text: 'applied',
					excludeWhenEmpty: true,
				}, {
					count: presetsFailed,
					color: c.green.red,
					text: 'failed',
					excludeWhenEmpty: true,
				})} \n`
				text += ` ${c.gray('Actions')}  ${formatResult({
					count: actionsSucceeded,
					color: c.green.bold,
					text: 'executed',
				},
				{
					count: actionsFailed,
					color: c.green.red,
					text: 'failed',
					excludeWhenEmpty: true,
				})} \n`
				text += `${c.gray('Duration')}  ${time(contexts[0].start, contexts[0].end)}`
				text += '\n'

				// Displays post-install messages
				const hl = (text: string) => c.magenta(text)
				const b = (text: string) => c.bold(text)
				const postInstall = typeof contexts[0].preset.postInstall === 'function'
					? contexts[0].preset.postInstall({ context: contexts[0], hl, b })
					: contexts[0].preset.postInstall

				// Display errors
				if (main.status === 'failed') {
					failedPresets.add(main.id)
					text += '\n\n'
					text += ` ${format.titleFail(` ${main.error?.code ?? 'ERROR'} `)} ${c.red(main.error?.parent?.message ?? main.error?.message ?? main.error?.details ?? 'An unknown error occured.')}`
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
		
		emitter.on('prompt:select', async (promptSelect) => {
			const { stdin, stdout } = process
			const isSelect = true
			const initialCursor = promptSelect.initial || 0

			const choices = promptSelect.choices.map((ch) => ({
				title: typeof ch === 'string' ? ch : ch.title,
				value: typeof ch === 'string' ? ch : ch.value || ch.title,
			}))

			const state = {
				cursor: initialCursor,
				response: choices[initialCursor].value,
				isDone: false
			}

			inputs.push({ ...promptSelect, ...state })

			const updateInput = (actionContextId, state) => {
				const idx = inputs.findIndex((input) => input.actionContextId === actionContextId)
				inputs[idx].cursor = state.cursor
				inputs[idx].response = state.response
				inputs[idx].isDone = state.isDone
			}

			const moveCursor = (n) => {
				state.cursor = n
				state.response = choices[n].value
				updateInput(promptSelect.actionContextId, state)
			}

			const actions = {
				up: () => {
					if (state.cursor === 0) {
						moveCursor(choices.length - 1)
					} else {
						moveCursor(state.cursor - 1)
					}
				},
				down: () => {
					if (state.cursor === choices.length - 1) {
						moveCursor(0)
					} else {
						moveCursor(state.cursor + 1)
					}
				},
				submit: () => {
					state.isDone = true
					updateInput(promptSelect.actionContextId, state)
					stdout.write('\n')
					close()
				}
			}

			const keypress = (str, key) => {
				let a = action(key, isSelect)
				if (a === false) {
					this._ && this._(str, key)
				} else if (typeof actions[a] === 'function') {
					actions[a](key)
				} else {
					stdout.write(beep)
				}
			}

			const close = () => {
				const input = inputs.at(-1)!

				stdout.write(cursor.show)
				stdin.removeListener('keypress', keypress)

				if (stdin.isTTY) {
					stdin.setRawMode(false)
				}

				emitter.emit('prompt:response', {
					id: input.id,
					response: input.response,
				})
			}

			if (stdin.isTTY) {
				stdin.setRawMode(true)
			}

			stdin.on('keypress', keypress)
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

				rl = readline.createInterface({ input: process.stdin, escapeCodeTimeout: 50 })
				readline.emitKeypressEvents(process.stdin, rl)

				timer = setInterval(() => render(), 150)
			}
		})

		emitter.on('preset:end', (context) => {
			if (context.count === 0) {
				setTimeout(() => {
					render()
					clearInterval(timer)
					rl?.close()

					if (failedPresets.size > 0) {
						process.exit(1)
					}
				}, 1)
			}
		})
	},
})
