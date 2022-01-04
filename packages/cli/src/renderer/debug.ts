import { enable } from 'debug'
import { makeRenderer } from '../types'

export const debugRenderer = makeRenderer({
	name: 'debug',
	registerEvents: () => enable('preset:*'),
})
