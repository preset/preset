import { type ActionContext, type ActionOptions, type ApplyOptions, createPresetContext, type LocalPreset, type Preset, type PromptChoice } from '@preset/core'
import type { SelectInput } from '../../../src/reporters/renderers/select-prompt'
import type { TextInput } from '../../../src/reporters/renderers/text-prompt'

export function makePresetContext() {
	const testPreset: Preset = { name: 'test_preset_name', options: {}, apply: async () => false }
	const testApplyOptions: ApplyOptions = { resolvable: '', targetDirectory: '', rawArguments: [], parsedOptions: {} }
	const testLocalPreset: LocalPreset = { rootDirectory: '', presetFile: '' }

	return createPresetContext(testPreset, testApplyOptions, testLocalPreset)
}

export function makeActionContext(options: ActionOptions<any> = {}): ActionContext {
	return {
		id: 'test_action_id',
		options,
		presetContextId: 'test_id',
		name: 'test_action_name',
		start: 1,
		end: 2,
		status: 'applying',
		log: [],
	}
}

export function makeTextInput(response: string = '', actionContextId: string = 'test_action_id'): TextInput {
	return {
		id: 'test_input_id',
		actionContextId,
		isSelect: false,
		name: 'test_input_name',
		text: 'Test Text',
		response,
	}
}

export function makeSelectInput(choices: PromptChoice[], cursor: number = 0, isDone: boolean = false): SelectInput {
	return {
		id: 'test_input_id',
		actionContextId: 'test_action_id',
		isSelect: true,
		name: 'test_input_name',
		text: 'Test Text',
		choices,
		response: 'Response',
		cursor,
		isDone,
	}
}
