import { makeRenderer } from '../types'

export const nullRenderer = makeRenderer({
	name: 'null',
	registerEvents: () => {},
})
