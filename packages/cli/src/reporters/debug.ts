import _debug from 'debug'
import { makeReporter } from '../types'

export default makeReporter({
	name: 'debug',
	registerEvents: () => _debug.enable('preset:*'),
})
