import { popCurrentContext } from '@preset/core'

import { afterEach, it, expect } from 'vitest'

import { format } from '../../../src/reporters/renderers/text-formater'
import { symbols } from '../../../src/reporters/renderers/symbols'
import renderTextPrompt, { TextInput } from '../../../src/reporters/renderers/text-prompt'
import { makeActionContext, makePresetContext, makeTextInput } from './utils'

const promptDefault: string = 'Some default text'
const text: string = 'This is text...'

afterEach(() => popCurrentContext())

it('renders default', async() => {
	const presetContext = await makePresetContext()
	const actionContext = makeActionContext({ default: promptDefault, text })
	const textInput = makeTextInput() as TextInput

	const result = renderTextPrompt(presetContext, actionContext, textInput)

	expect(result).toEqual(`
    ${format.dim(`${symbols.subArrow} ${text}`)} ${format.textPromptResponse(promptDefault)}`,
	)
})

it('renders response', async() => {
	const response: string = 'some response'

	const presetContext = await makePresetContext()
	const actionContext = makeActionContext({ default: promptDefault, text })
	const textInput = makeTextInput(response) as TextInput

	const result = renderTextPrompt(presetContext, actionContext, textInput)

	expect(result).toEqual(`
    ${format.dim(`${symbols.subArrow} ${text}`)} ${format.textPromptResponse(response)}`,
	)
})

it('trims response', async() => {
	const responseText: string = 'some response with leading and trailing spaces'
	const response: string = `   ${responseText}   `

	const presetContext = await makePresetContext()
	const actionContext = makeActionContext({ default: promptDefault, text })
	const textInput = makeTextInput(response) as TextInput

	const result = renderTextPrompt(presetContext, actionContext, textInput)

	expect(result).toEqual(`
    ${format.dim(`${symbols.subArrow} ${text}`)} ${format.textPromptResponse(responseText)}`,
	)
})

it('indents when multiple presets present', async() => {
	await makePresetContext()
	const presetContext = await makePresetContext()
	const actionContext = makeActionContext({ default: promptDefault, text })
	const textInput = makeTextInput() as TextInput

	const result = renderTextPrompt(presetContext, actionContext, textInput)

	expect(result).toEqual(`
      ${format.dim(`${symbols.subArrow} ${text}`)} ${format.textPromptResponse(promptDefault)}`,
	)

	popCurrentContext()
})
