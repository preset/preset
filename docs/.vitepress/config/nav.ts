import type { DefaultTheme } from 'vitepress'

export const nav: DefaultTheme.Config['nav'] = [
  {
    text: 'Guide',
    items: [
      { text: 'Getting started', link: '/guide/' },
      { text: 'Installation', link: '/guide/installation' },
      { text: 'Configuration', link: '/guide/configuration' },
      { text: 'Migration', link: '/guide/migration' },
      { text: 'Features', link: '/features/' },
    ],
  },
  {
    text: 'Actions',
    items: [
      { text: 'Extract templates', link: '/actions/extract-templates' },
    ],
  },
  {
    text: 'Community',
    items: [
      { text: 'GitHub', link: 'https://github.com/preset/preset' },
      { text: 'Discussions', link: 'https://github.com/preset/preset/discussions' },
      { text: 'Twitter', link: 'https://twitter.com/enzoinnocenzi' },
    ],
  },
]
