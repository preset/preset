import { popCurrentContext } from '@preset/core'

import { afterEach, it, expect } from 'vitest'

import { format } from '../../../src/reporters/renderers/text-formater'
import { symbols } from '../../../src/reporters/renderers/symbols'

import type { TextInput } from '../../../src/reporters/renderers/text-prompt'

import renderPrompt from '../../../src/reporters/renderers/prompt'
import renderSelectPrompt, { type SelectInput } from '../../../src/reporters/renderers/select-prompt'
import { makeActionContext, makePresetContext, makeSelectInput, makeTextInput } from './utils'

afterEach(() => popCurrentContext())

it('renders empty string when no inputs are found', async() => {
	const promptDefault: string = 'Some default text'
	const text: string = 'This is text...'

	const presetContext = await makePresetContext()
	const actionContext = makeActionContext({ default: promptDefault, text })
	const textInput = makeTextInput('response', 'unknown_id') as TextInput

	const result = renderPrompt(presetContext, actionContext, [textInput])

	expect(result).toEqual('')
})

it('renders text input', async() => {
	const promptDefault: string = 'Some default text'
	const text: string = 'This is text...'

	const presetContext = await makePresetContext()
	const actionContext = makeActionContext({ default: promptDefault, text })
	const textInput = makeTextInput() as TextInput

	const result = renderPrompt(presetContext, actionContext, [textInput])

	expect(result).toEqual(`
    ${format.dim(`${symbols.subArrow} ${text}`)} ${format.textPromptResponse(promptDefault)}`,
	)
})

it('renders select input', async() => {
	const promptChoices: string[] = ['first', 'second']

	const presetContext = await makePresetContext()
	const actionContext = makeActionContext()
	const selectInput = makeSelectInput(promptChoices) as SelectInput

	const result = renderSelectPrompt(presetContext, actionContext, selectInput)

	expect(result).toEqual(
		`
      ${symbols.pointerDouble} ${format.selectedChoice(promptChoices[0])}
        ${promptChoices[1]}
`,
	)
})
