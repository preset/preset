import { execSync } from 'node:child_process'
import { defineConfig } from 'vitepress'
import Unocss from 'unocss/vite'

const production = process.env.NODE_ENV === 'production'
const title = 'Preset'
const description = 'Elegant, ecosystem-agnostic preset mechanism'
const site = production ? 'https://preset.dev' : 'http://localhost:3000'
const image = `${site}/banner.png`
const twitter = 'enzoinnocenzi'
const github = 'https://github.com/preset/preset'

const branch = execSync('echo $BRANCH | grep . || git rev-parse --abbrev-ref HEAD')

export default defineConfig({
	title,
	description,
	lang: 'en-US',
	srcDir: 'src',
	appearance: 'dark',

	head: [
		['meta', { name: 'author', content: 'Enzo Innocenzi' }],
		['meta', { name: 'keywords', content: 'preset, scaffolding, node, vue cli, sao, yeoman, plopjs, scaffold' }],
		['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
		['meta', { name: 'HandheldFriendly', content: 'True' }],
		['meta', { name: 'MobileOptimized', content: '320' }],
		['meta', { name: 'theme-color', content: '#d8b4fe' }],
		['meta', { name: 'twitter:card', content: 'summary_large_image' }],
		['meta', { name: 'twitter:site', content: `@${twitter}` }],
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
	],

	themeConfig: {
		logo: '/logo.svg',

		search: {
			provider: 'local',
		},

		nav: [
			{ text: 'Documentation', link: '/introduction' },
			{
				text: 'Actions',
				items: [
					{ text: 'Extract templates', link: '/action/extract-templates' },
					{ text: 'Install packages', link: '/action/install-packages' },
					{ text: 'Execute command', link: '/action/execute-command' },
					{ text: 'Edit files', link: '/action/edit-files' },
					{ text: 'Rename paths', link: '/action/rename-paths' },
					{ text: 'Delete paths', link: '/action/delete-paths' },
					{ text: 'Apply nested preset', link: '/action/apply-nested-preset' },
					{ text: 'Group', link: '/action/group' },
					{ text: 'Prompt', link: '/action/prompt' },
				],
			},
			{
				text: 'Ecosystem',
				items: [
					{ text: 'Laravel presets', link: 'https://github.com/laravel-presets' },
					{ text: 'Preset list', link: 'https://github.com/preset/awesome' },
				],
			},
		],

		sidebar: {
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
						{ text: 'Rename paths', link: '/action/rename-paths' },
						{ text: 'Delete paths', link: '/action/delete-paths' },
						{ text: 'Apply nested preset', link: '/action/apply-nested-preset' },
						{ text: 'Group', link: '/action/group' },
						{ text: 'Prompt', link: '/action/prompt' },
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
		},

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/preset/preset' },
			{ icon: 'twitter', link: `https://twitter.com/${twitter}` },
		],

		editLink: {
			pattern: `${github}/edit/${branch}/docs/:path`,
			text: 'Suggest changes to this page',
		},

		footer: {
			message: 'Made with <span class="i-mdi:cards-heart mx-1 inline-block text-pink-300"></span> by <a class="ml-1 underline" href="https://twitter.com/enzoinnocenzi">Enzo Innocenzi</a>',
		},
	},

	vite: {
		plugins: [
			Unocss(),
		],
	},
})
