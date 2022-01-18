import fs from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import Components from 'unplugin-vue-components/vite'
import WindiCSS from 'vite-plugin-windicss'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import ViteRestart from 'vite-plugin-restart'

export default defineConfig({
	resolve: {
		alias: {
			'@/': `${resolve(__dirname, '.vitepress/theme')}/`,
		},
	},
	plugins: [
		Components({
			dirs: [
				'.vitepress/theme/components',
			],
			extensions: ['vue', 'ts'],
			include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
			resolvers: [
				IconsResolver({
					componentPrefix: '',
				}),
			],
			dts: true,
		}),
		Icons(),
		WindiCSS(),
		ViteRestart({
			restart: '.vitepress/config/*.*',
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
