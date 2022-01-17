import fs from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import Components from 'unplugin-vue-components/vite'
import Unocss from 'unocss/vite'
import { presetIcons } from 'unocss'
import presetWind from '@unocss/preset-wind'

export default defineConfig({
	plugins: [
		Components({
			include: [/\.vue/, /\.md/],
			dts: true,
		}),
		Unocss({
			presets: [
				presetWind(),
				presetIcons({
					scale: 1.2,
				}),
			],
		}),
		IncludesPlugin(),
	],

	optimizeDeps: {
		include: [
			'vue',
			'@vueuse/core',
		],
		exclude: [
			'vue-demi',
		],
	},
})

function IncludesPlugin(): Plugin {
	return {
		name: 'include-plugin',
		enforce: 'pre',
		transform(code, id) {
			let changed = false
			code = code.replace(/\[@@include\]\((.*?)\)/, (_, url) => {
				changed = true
				const full = resolve(id, url)

				return fs.readFileSync(full, 'utf-8')
			})
			if (changed) {
				return code
			}
		},
	}
}
