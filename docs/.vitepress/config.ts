import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Preset',
  description: 'An elegant, ecosystem-agnostic preset mechanism',
  head: [
    ['meta', { property: 'og:title', content: 'Preset' }],
    ['meta', { property: 'og:description', content: 'An elegant, ecosystem-agnostic preset mechanism' }],
    ['meta', { property: 'og:url', content: 'https://preset.dev/' }],
    ['meta', { property: 'og:image', content: 'https://preset.dev/og.png' }],
    ['meta', { name: 'twitter:title', content: 'Preset' }],
    ['meta', { name: 'twitter:description', content: 'An elegant, ecosystem-agnostic preset mechanism' }],
    ['meta', { name: 'twitter:image', content: 'https://preset.dev/og.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600&display=swap', rel: 'stylesheet' }],
  ],
  themeConfig: {
    repo: 'preset/preset',
    logo: '/logo.svg',
    docsDir: 'docs',
    docsBranch: 'main',
    editLinks: true,
    editLinkText: 'Suggest changes to this page',
    nav: [
      { text: 'Docs', link: '/basics/introduction' },
      { text: 'API', link: '/api/' },
      {
        text: 'Twitter',
        link: 'https://twitter.com/innocenzi'
      },
    ],

    sidebar: {
      '/config/': 'auto',
      '/': [
        {
          text: 'Basics',
          children: [
            {
              text: 'Introduction',
              link: '/basics/introduction',
            },
            {
              text: 'Getting started',
              link: '/basics/getting-started',
            },
            {
              text: 'Alternatives',
              link: '/basics/alternatives',
            },
          ]
        },
				
        {
          text: 'Concepts',
          children: [
            {
              text: 'Configuration',
              link: '/concepts/configuration',
            },
            {
              text: 'Actions',
              link: '/concepts/actions',
            },
            {
              text: 'Templates',
              link: '/concepts/templates',
            },
          ]
        },
				
        {
          text: 'Guides',
          children: [
            {
              text: 'Writing a preset',
              link: '/guide/writing-a-preset',
            },
            {
              text: 'Hosting',
              link: '/guide/hosting',
            },
            {
              text: 'Using a preset',
              link: '/guide/using-a-preset',
            },
          ]
        },

        {
          text: 'Actions',
          children: [
            {
              text: 'Extract templates',
              link: '/actions/extract-templates',
            },
            {
              text: 'Install packages',
              link: '/actions/install-packages',
            },
            {
              text: 'Execute command',
              link: '/actions/execute-command',
            },
            {
              text: 'Edit file',
              link: '/actions/edit-file',
            },
            {
              text: 'Delete paths',
              link: '/actions/delete-paths',
            },
            {
              text: 'Apply nested preset',
              link: '/actions/apply-nested-preset',
            },
            {
              text: 'Group',
              link: '/actions/group',
            },
            {
              text: 'Prompt (experimental)',
              link: '/actions/prompt',
            },
          ]
        },
				
        {
          text: 'API',
          children: [
            {
              text: 'Programmatic API',
              link: '/api/programmatic',
            },
          ]
        },
      ]
    }
  }
})
