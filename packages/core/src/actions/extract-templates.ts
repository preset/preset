import { defineAction } from '../api'

export interface ExtractTemplatesOptions {
	from?: string
	to?: string
	whenConflict?: 'override' | 'skip'
	extractDotfiles?: boolean
}

export const extractTemplates = defineAction<ExtractTemplatesOptions>('extract-templates', async({ options }) => {
	if (options.to === '.') {
		throw new Error('No target directory')
	}

	return true
}, {
	from: 'templates',
	to: '.',
	whenConflict: 'override',
	extractDotfiles: false,
})
