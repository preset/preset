import type { HeadConfig } from 'vitepress'
import { metaData } from './constants'

const head: HeadConfig[] = [
  ['meta', { name: 'author', content: 'Enzo Innocenzi' }],
  ['meta', { name: 'keywords', content: 'preset, scaffolding, scaffold, sao, yeoman, plop, usepreset' }],
	['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],

  ['meta', { name: 'HandheldFriendly', content: 'True' }],
  ['meta', { name: 'MobileOptimized', content: '320' }],
  ['meta', { name: 'theme-color', content: '#7f9cf5' }],

  ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ['meta', { name: 'twitter:site', content: metaData.site }],
  ['meta', { name: 'twitter:title', value: metaData.title }],
  ['meta', { name: 'twitter:description', value: metaData.description }],
  ['meta', { name: 'twitter:image', content: metaData.image }],

  ['meta', { property: 'og:type', content: 'website' }],
  ['meta', { property: 'og:locale', content: 'en_US' }],
  ['meta', { property: 'og:site', content: metaData.site }],
  ['meta', { property: 'og:site_name', content: metaData.title }],
  ['meta', { property: 'og:title', content: metaData.title }],
  ['meta', { property: 'og:image', content: metaData.image }],
  ['meta', { property: 'og:description', content: metaData.description }],

  ['link', { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' }],
  ['link', { rel: 'preconnect', crossorigin: 'anonymous', href: 'https://fonts.gstatic.com' }],
  ['link', { href: 'https://fonts.googleapis.com/css2?family=Fira+Code&family=Inter:wght@200;400;500;600&display=swap', rel: 'stylesheet' }],
]

export default head
