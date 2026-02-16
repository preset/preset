import { emitter } from '@preset/core'
import _debug from 'debug'
import { makeReporter } from '../types'

export default makeReporter({
	name: 'debug',
	registerEvents: () => {
		_debug.enable('preset:*')
		const failedPresets: Set<string> = new Set([])
		emitter.on('preset:end', (context) => {
			if (context.status === 'failed') {
				failedPresets.add(context.id)
			}

			if (context.count === 0 && failedPresets.size > 0) {
				process.exit(1)
			}
		})
	},
})
