import type { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Config['sidebar'] = {
	'/actions/': [
		{
			text: 'Actions',
			children: [
				{
					text: 'Extract templates',
					link: '/actions/extract-templates',
				},
			],
		},
	],
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
			],
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
			],
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
			],
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
			],
		},

		{
			text: 'API',
			children: [
				{
					text: 'Programmatic API',
					link: '/api/programmatic',
				},
			],
		},
	],
}
