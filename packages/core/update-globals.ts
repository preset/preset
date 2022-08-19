import fs from 'node:fs'
import path from 'node:path'
import * as actions from './src/actions'

const globalsFile = path.resolve(__dirname, './globals.d.ts')

function erase() {
	fs.unlinkSync(globalsFile)
}

function write() {
	const actionImports = Object.keys(actions)
		.filter((name) => !['default'].includes(name))
		.map((name) => `const ${name}: typeof import('@preset/core')['${name}']`)

	const globals = `declare global {
		const definePreset: typeof import('@preset/core')['definePreset']
		const defineAction: typeof import('@preset/core')['defineAction']
		${actionImports.join('\n	')}
	}
	export {}\n`

	fs.writeFileSync(globalsFile, globals)
}

if (process.argv.includes('--delete')) {
	erase()
} else {
	write()
}
