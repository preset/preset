import { defineAction } from '..'

interface ExtractTemplatesOptions {
	from?: string
	to?: string
	whenConflict?: 'override' | 'skip'
	extractDotfiles?: boolean
}

export const extractTemplates = defineAction<ExtractTemplatesOptions>('extract-template', async({ options }) => {
	throw new Error('Not yet implemented')
}, {
	from: 'templates',
	to: '.',
	whenConflict: 'override',
	extractDotfiles: false,
})
