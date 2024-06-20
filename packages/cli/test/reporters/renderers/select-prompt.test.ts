import { popCurrentContext } from '@preset/core'

import { afterEach, expect, it } from 'vitest'

import { format } from '../../../src/reporters/renderers/text-formater'
import { symbols } from '../../../src/reporters/renderers/symbols'
import renderSelectPrompt, { type SelectInput } from '../../../src/reporters/renderers/select-prompt'
import { makeActionContext, makePresetContext, makeSelectInput } from './utils'

const cursor = 0
const hint: string = 'This is a hint...'
const promptChoices: string[] = ['first', 'second', 'third']

afterEach(() => popCurrentContext())

it('renders hint', async () => {
	const presetContext = await makePresetContext()
	const actionContext = makeActionContext({ text: hint })
	const selectInput = makeSelectInput(promptChoices, cursor) as SelectInput

	const result = renderSelectPrompt(presetContext, actionContext, selectInput)

	expect(result).toEqual(
		` ${format.promptHint(symbols.pointerSmall)} ${format.promptHint(hint)}
      ${symbols.pointerDouble} ${format.selectedChoice(promptChoices[cursor])}
        ${promptChoices[1]}
        ${promptChoices[2]}
`,
	)
})

it('renders choices', async () => {
	const presetContext = await makePresetContext()
	const actionContext = makeActionContext()
	const selectInput = makeSelectInput(promptChoices, cursor) as SelectInput

	const result = renderSelectPrompt(presetContext, actionContext, selectInput)

	expect(result).toEqual(
		`
      ${symbols.pointerDouble} ${format.selectedChoice(promptChoices[cursor])}
        ${promptChoices[1]}
        ${promptChoices[2]}
`,
	)
})

it('renders selected choice based on cursor', async () => {
	const cursor = 1

	const presetContext = await makePresetContext()
	const actionContext = makeActionContext()
	const selectInput = makeSelectInput(promptChoices, cursor) as SelectInput

	const result = renderSelectPrompt(presetContext, actionContext, selectInput)

	expect(result).toEqual(
		`
        ${promptChoices[0]}
      ${symbols.pointerDouble} ${format.selectedChoice(promptChoices[cursor])}
        ${promptChoices[2]}
`,
	)
})

it('renders response when done', async () => {
	const presetContext = await makePresetContext()
	const actionContext = makeActionContext({ text: hint })
	const selectInput = makeSelectInput(promptChoices, cursor, true) as SelectInput

	const result = renderSelectPrompt(presetContext, actionContext, selectInput)

	expect(result).toEqual(` ${symbols.pointerSmall} Response`)
})

it('indents when multiple presets present', async () => {
	await makePresetContext()

	const presetContext = await makePresetContext()
	const actionContext = makeActionContext()
	const selectInput = makeSelectInput(promptChoices, cursor) as SelectInput

	const result = renderSelectPrompt(presetContext, actionContext, selectInput)

	expect(result).toEqual(
		`
        ${symbols.pointerDouble} ${format.selectedChoice(promptChoices[cursor])}
          ${promptChoices[1]}
          ${promptChoices[2]}
`,
	)

	popCurrentContext()
})
