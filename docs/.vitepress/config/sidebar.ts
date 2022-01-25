import type { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Config['sidebar'] = {
	'/': [
		{
			text: 'Basics',
			children: [
				{
					text: 'Introduction',
					link: '/',
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
					text: 'Preset file',
					link: '/concepts/preset-file',
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
					text: 'Using aliases',
					link: '/guide/using-aliases',
				},
				{
					text: 'Hosting',
					link: '/guide/hosting',
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
					text: 'Edit files',
					link: '/actions/edit-files',
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
