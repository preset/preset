import { bundleRequire } from 'bundle-require'

// https://github.com/egoist/bundle-require/blob/main/src/index.ts
export async function loadPreset(filepath: string) {
	const mod = await bundleRequire({ filepath })
	console.log(mod)
}
