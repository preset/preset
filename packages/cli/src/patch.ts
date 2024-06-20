import type { CAC } from 'cac'

const patches = {
	help: {
		description: 'Display this help message.',
	},
	version: {
		description: 'Display the version number.',
	},
}

/**
 * Applies property patches to CAC.
 */
export function patch(cli: CAC) {
	cli.globalCommand.options.forEach((option) => {
		if (Reflect.has(patches, option.name)) {
			Object.entries<string>(Reflect.get(patches, option.name))
				.forEach(([key, value]) => Reflect.set(option, key, value))
		}
	})

	return cli
}
