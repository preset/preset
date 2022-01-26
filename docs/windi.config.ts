import { defineConfig } from 'vite-plugin-windicss'
import typography from 'windicss/plugin/typography'

export default defineConfig({
	extract: {
		include: [
			'.vitepress/theme/**/*.{ts,vue}',
		],
	},
	safelist: [
		'pb-5',
		'logo-float-xl',
		'dark:text-white',
		'opacity-85',
	],
	shortcuts: {
		'logo-float-xl': 'text-6xl m-2 mr-6 float-right',
	},
	theme: {
		extend: {
			screens: {
				'2xl': '1400px',
			},
			colors: {
				primary: {
					DEFAULT: '#7f9cf5',
					50: '#f5f8fa',
					100: '#def0fb',
					200: '#b9ddf7',
					300: '#8abdeb',
					400: '#5a98dc',
					500: '#4575cd',
					600: '#3a5ab9',
					700: '#2e4496',
					800: '#212e6d',
					900: '#131d46',
				},
			},
			typography: {
				DEFAULT: {
					css: {
						'maxWidth': 'none',
						'color': 'inherit',
						'a': {
							color: '#7f9cf5',
							textDecoration: 'none',
						},
						'b': { color: 'inherit' },
						'strong': { color: 'inherit' },
						'em': { color: 'inherit' },
						'h1': { color: 'inherit' },
						'h2': { color: 'inherit' },
						'h3': { color: 'inherit' },
						'h4': { color: 'inherit' },
						'pre': { color: 'inherit', fontSize: '.9rem' },
						'thead': { color: 'inherit' },
						'blockquote': { color: 'inherit' },
						'table': { borderCollapse: 'collapse' },
						'code': {
							'font-family': 'Consolas, -ui-monospace, SFMono-Regular, Menlo, monospace',
							'background-color': '#1f1f1f',
							'color': 'white',
							'padding': '1px 5px',
							'border-radius': '4px',
						},
						'p code': {
							color: '#7f9cf5',
						},
						'code::before': { content: '' },
						'code::after': { content: '' },
					},
				},
			},
		},
	},
	plugins: [
		typography(),
	],
})
