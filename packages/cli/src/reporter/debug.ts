import _debug from 'debug'
import { makeReporter } from '../types'

export const debug = makeReporter({
	name: 'debug',
	registerEvents: () => _debug.enable('preset:*'),
})
