import { debug } from './utils'

export type Code =
	| 'ERR_NOT_RESOLVED'
	| 'ERR_PRESET_FILE_NOT_FOUND'
	| 'ERR_PRESET_FAILED'
	| 'ERR_ACTIONS_FAILED'
	| 'ERR_ACTION_FAILED'
	| 'ERR_MISSING_CONTEXT'
	| 'ERR_PRESET_NO_EXPORT'
	| 'ERR_INVALID_PRESET'
	| 'ERR_CLONE_PRESET'

interface PresetErrorOptions {
	code: Code
	details: string
	parent?: Error
}

export class PresetError extends Error {
	public code: Code
	public details: string
	public parent?: Error

	constructor(error: PresetErrorOptions) {
		super()
		debug.error('An exception has been thrown.', error)

		this.message = error.parent?.message ?? error.details
		this.stack = error.parent?.stack ?? ''
		this.code = error.code
		this.details = error.details
		this.parent = error.parent
	}
}
