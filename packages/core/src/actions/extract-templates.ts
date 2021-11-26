import { defineAction } from '..'

interface ExtractTemplateOptions {
	from: string
	to: string
	whenConflict: 'override' | 'skip'
	extractDotfiles: boolean
}

export const extractTemplate = defineAction<ExtractTemplateOptions>('extract-template', async({ context, options }) => {
	throw new Error('Not yet implemented')
})
