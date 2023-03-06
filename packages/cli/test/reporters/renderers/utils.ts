import {
	ActionContext,
	ActionOptions,
	ApplyOptions,
	createPresetContext,
	LocalPreset,
	Preset,
	PromptChoice,
} from '@preset/core'
import { TextInput } from '../../../src/reporters/renderers/text-prompt'
import { SelectInput } from '../../../src/reporters/renderers/select-prompt'

export const makePresetContext = () => {
	const testPreset: Preset = { name: 'test_preset_name', options: {}, apply: async() => false }
	const testApplyOptions: ApplyOptions = { resolvable: '', targetDirectory: '', rawArguments: [], parsedOptions: {} }
	const testLocalPreset: LocalPreset = { rootDirectory: '', presetFile: '' }

	return createPresetContext(testPreset, testApplyOptions, testLocalPreset)
}

export const makeActionContext = (options: ActionOptions<any> = {}): ActionContext => ({
	id: 'test_action_id',
	options,
	presetContextId: 'test_id',
	name: 'test_action_name',
	start: 1,
	end: 2,
	status: 'applying',
	log: [],
})

export const makeTextInput = (
	response: string = '',
	actionContextId: string = 'test_action_id',
): TextInput => ({
	id: 'test_input_id',
	actionContextId,
	isSelect: false,
	name: 'test_input_name',
	text: 'Test Text',
	response,
})

export const makeSelectInput = (
	choices: PromptChoice[],
	cursor: number = 0,
	isDone: boolean = false,
): SelectInput => ({
	id: 'test_input_id',
	actionContextId: 'test_action_id',
	isSelect: true,
	name: 'test_input_name',
	text: 'Test Text',
	choices,
	response: 'Response',
	cursor,
	isDone,
})
