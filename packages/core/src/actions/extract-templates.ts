import { defineAction } from '../api'

export interface ExtractTemplatesOptions {
	from?: string
	to?: string
	whenConflict?: 'override' | 'skip'
	extractDotfiles?: boolean
}

const defaultOptions: Required<ExtractTemplatesOptions> = {
	from: 'templates',
	to: '',
	whenConflict: 'override',
	extractDotfiles: false,
}

export const extractTemplates = defineAction<ExtractTemplatesOptions, Required<ExtractTemplatesOptions>>(
	'extract-templates',
	async() => {
		return false
	},
	defaultOptions,
)
