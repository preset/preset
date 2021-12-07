import { bundleRequire } from 'bundle-require'
import { debug } from './utils'

/**
 * Imports the preset file.
 *
 * @param filepath Absolute path to the file.
 */
export async function importPresetFile(filepath: string) {
	debug.import(`Importing "${filepath}" with bundle-require."`)

	// https://github.com/antfu/local-pkg
	const result = await bundleRequire({ filepath })

	return result.default ?? result
}
