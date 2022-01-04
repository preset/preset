import { enable } from 'debug'
import { makeReporter } from '../types'

export const debug = makeReporter({
	name: 'debug',
	registerEvents: () => enable('preset:*'),
})
