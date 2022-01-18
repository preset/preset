import type { DefaultTheme } from 'vitepress'
import { sidebar } from './sidebar'
import { nav } from './nav'

const themeConfig: DefaultTheme.Config = {
	algolia: {
		appId: '',
		apiKey: '',
		indexName: 'preset',
	},
	repo: 'preset/preset',
	logo: '/logo.svg',
	docsRepo: 'preset/preset',
	docsDir: 'docs',
	docsBranch: 'main',
	editLinks: true,
	editLinkText: 'Suggest changes to this page',
	nav,
	sidebar,
}

export default themeConfig
