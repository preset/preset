import { defineAction } from '../api'

interface ApplyPresetOptions {
	resolvable: string
	args: string[]
	inheritsArguments: boolean
}

export const applyPreset = defineAction<ApplyPresetOptions>('apply-preset', async({ options }) => {
	// apply preset

	throw new Error('Not yet implemented')
})
