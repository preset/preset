import baseConfig from '@vue/theme/config'
import { defineConfigWithTheme, HeadConfig, UserConfig } from 'vitepress'
import type { Config } from '@vue/theme'
import { NavItem, SidebarConfig } from '@vue/theme/src/vitepress/config'

const production = process.env.NODE_ENV === 'production'
const title = 'Preset'
const description = 'Elegant, ecosystem-agnostic preset mechanism'
const site = production ? 'https://preset.dev' : 'http://localhost:3000'
const image = `${site}/banner.png`

const head: HeadConfig[] = [
	['meta', { name: 'author', content: 'Enzo Innocenzi' }],
	['meta', { name: 'keywords', content: 'preset, scaffolding, node, vue cli, sao, yeoman, plopjs, scaffold' }],
	['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
	['meta', { name: 'HandheldFriendly', content: 'True' }],
	['meta', { name: 'MobileOptimized', content: '320' }],
	['meta', { name: 'theme-color', content: '#d8b4fe' }],
	['meta', { name: 'twitter:card', content: 'summary_large_image' }],
	['meta', { name: 'twitter:site', content: site }],
	['meta', { name: 'twitter:title', value: title }],
	['meta', { name: 'twitter:description', value: description }],
	['meta', { name: 'twitter:image', content: image }],
	['meta', { property: 'og:type', content: 'website' }],
	['meta', { property: 'og:locale', content: 'en_US' }],
	['meta', { property: 'og:site', content: site }],
	['meta', { property: 'og:site_name', content: title }],
	['meta', { property: 'og:title', content: title }],
	['meta', { property: 'og:image', content: image }],
	['meta', { property: 'og:description', content: description }],
]

const nav: NavItem[] = [
	{ text: 'Docs', link: '/introduction' },
	{
		text: 'Actions',
		items: [
			{ text: 'Extract templates', link: '/action/extract-templates' },
			{ text: 'Install packages', link: '/action/install-packages' },
			{ text: 'Execute command', link: '/action/execute-command' },
			{ text: 'Edit files', link: '/action/edit-files' },
			{ text: 'Delete paths', link: '/action/delete-paths' },
			{ text: 'Apply nested preset', link: '/action/apply-nested-preset' },
			{ text: 'Group', link: '/action/group' },
			{ text: 'Prompt (experimental)', link: '/action/prompt' },
		],
	},
	{
		text: 'Ecosystem',
		items: [
			{ text: 'Laravel presets', link: 'https://github.com/laravel-presets' },
			{ text: 'Preset list', link: 'https://github.com/preset/awesome' },
		],
	},
]

const sidebar: SidebarConfig = {
	'/': [
		{
			text: 'Getting started',
			items: [
				{ text: 'Introduction', link: '/introduction' },
				{ text: 'Quick start', link: '/quick-start' },
			],
		},
		{
			text: 'Concepts',
			items: [
				{ text: 'Preset file', link: '/concepts/preset-file' },
				{ text: 'Actions', link: '/concepts/actions' },
				{ text: 'Templates', link: '/concepts/templates' },
			],
		},
		{
			text: 'Guides',
			items: [
				{ text: 'Writing a preset', link: '/guide/writing-a-preset' },
				{ text: 'Using aliases', link: '/guide/using-aliases' },
				{ text: 'Hosting', link: '/guide/hosting' },
			],
		},
		{
			text: 'Actions',
			items: [
				{ text: 'Extract templates', link: '/action/extract-templates' },
				{ text: 'Install packages', link: '/action/install-packages' },
				{ text: 'Execute command', link: '/action/execute-command' },
				{ text: 'Edit files', link: '/action/edit-files' },
				{ text: 'Delete paths', link: '/action/delete-paths' },
				{ text: 'Apply nested preset', link: '/action/apply-nested-preset' },
				{ text: 'Group', link: '/action/group' },
				{ text: 'Prompt (experimental)', link: '/action/prompt' },
			],
		},
		{
			text: 'Extra topics',
			items: [
				{ text: 'Programmatic API', link: '/extra-topics/programmatic-api' },
				{ text: 'Alternatives', link: '/extra-topics/alternatives' },
			],
		},
	],
}

export default defineConfigWithTheme<Config>({
	extends: baseConfig as () => UserConfig<Config>,
	title,
	head,
	description,
	lang: 'en-US',
	scrollOffset: 'header',
	srcDir: 'src',

	themeConfig: {
		nav,
		sidebar,

		// algolia: {
		// 	appId: 'UNQJXGJJCM',
		// 	apiKey: '13f1ef823ef6da38d5b51452d5768113',
		// 	indexName: 'preset',
		// },

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/preset/preset' },
			{ icon: 'twitter', link: 'https://twitter.com/enzoinnocenzi' },
		],

		// https://github.com/vuejs/theme/pull/44
		// editLink: {
		// 	repo: 'preset/preset',
		// 	text: 'Edit this page on Github',
		// },

		footer: {
			license: {
				text: 'MIT License',
				link: 'https://opensource.org/licenses/MIT',
			},
			copyright: 'Made with ❤️ by Enzo Innocenzi',
		},
	},

	vite: {
		server: {
			host: true,
			fs: {
				allow: ['../..'],
			},
		},
		build: {
			minify: 'terser',
			chunkSizeWarningLimit: Infinity,
			rollupOptions: {
				output: {
					chunkFileNames: 'assets/chunks/[name].[hash].js',
					manualChunks: (id, ctx) => moveToVendor(id, ctx),
				},
			},
		},
		json: {
			stringify: true,
		},
	},
})

const cache = new Map<string, boolean>()

/**
 * This is temporarily copied from Vite - which should be exported in a
 * future release.
 *
 * @TODO when this is exported by Vite, VitePress should ship a better
 * manual chunk strategy to split chunks for deps that are imported by
 * multiple pages but not all.
 */
function moveToVendor(id: string, { getModuleInfo }: any) {
	if (
		id.includes('node_modules')
    && !/\.css($|\\?)/.test(id)
    && staticImportedByEntry(id, getModuleInfo, cache)
	) {
		return 'vendor'
	}
}

function staticImportedByEntry(
	id: string,
	getModuleInfo: any,
	cache: Map<string, boolean>,
	importStack: string[] = [],
): boolean {
	if (cache.has(id)) {
		return cache.get(id) as boolean
	}
	if (importStack.includes(id)) {
		// circular deps!
		cache.set(id, false)

		return false
	}
	const mod = getModuleInfo(id)
	if (!mod) {
		cache.set(id, false)

		return false
	}

	if (mod.isEntry) {
		cache.set(id, true)

		return true
	}
	const someImporterIs = mod.importers.some((importer: string) =>
		staticImportedByEntry(
			importer,
			getModuleInfo,
			cache,
			importStack.concat(id),
		),
	)
	cache.set(id, someImporterIs)

	return someImporterIs
}
