import { makeReporter } from '../types'

export const _null = makeReporter({
	name: 'null',
	registerEvents: () => {},
})
