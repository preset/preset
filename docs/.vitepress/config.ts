import { defineConfig } from 'vitepress'
import { metaData } from './config/constants'
import { mdRenderFilename } from './config/markdown'
import head from './config/head'
import themeConfig from './config/theme'

export default defineConfig({
	title: 'Preset',
	description: metaData.description,
	head,
	themeConfig,
	srcExclude: ['README.md'],
	markdown: {
		config: (md) => md.use(mdRenderFilename),
	},
})
