import { it } from 'vitest'
import { editFile, EditFileOperation } from '../../src'
import { usingSandbox, dedent, expectStructureMatches } from '../utils'

interface EditFileTest {
	skip?: boolean
	only?: boolean
	operation: EditFileOperation
	fileBefore: string
	fileAfter: string
}

const testFile = 'file.txt'
const map: Record<string, EditFileTest> = {
	'updates content in the file': {
		operation: {
			type: 'update-content',
			update: (content) => content.replaceAll('l', 'w'),
		},
		fileBefore: 'Hello world',
		fileAfter: 'Hewwo worwd',
	},
	'updates variables in the file with default prefix @@': {
		operation: {
			type: 'replace-variables',
			variables: {
				username: 'Komi',
				likes: 'Tadano',
			},
		},
		fileBefore: 'Hello @@username, is it true that you like @@likes?',
		fileAfter: 'Hello Komi, is it true that you like Tadano?',
	},
	'updates variables in the file with custom prefix': {
		operation: {
			type: 'replace-variables',
			prefix: '%%',
			variables: {
				username: 'Komi',
				likes: 'Tadano',
			},
		},
		fileBefore: 'Hello %%username, is it true that you like %%likes? @@stuff',
		fileAfter: 'Hello Komi, is it true that you like Tadano? @@stuff',
	},
	'removes a line (by default) after another line': {
		operation: {
			type: 'remove-line',
			position: 'after',
			match: /First line/,
		},
		fileBefore: dedent`
			First line
			Second line
			Third line
		`,
		fileAfter: dedent`
			First line
			Third line
		`,
	},
	'removes multiple lines after another line': {
		operation: {
			type: 'remove-line',
			position: 'after',
			match: /Second line/,
			count: 2,
		},
		fileBefore: dedent`
			First line
			Second line
			Third line
			Fourth line
		`,
		fileAfter: dedent`
			First line
			Second line
		`,
	},
	'removes multiple lines after another line even if the count is too big': {
		operation: {
			type: 'remove-line',
			position: 'after',
			match: /Second line/,
			count: 5,
		},
		fileBefore: dedent`
			First line
			Second line
			Third line
			Fourth line
		`,
		fileAfter: dedent`
			First line
			Second line
		`,
	},
	'removes a line (by default) before another line': {
		operation: {
			type: 'remove-line',
			position: 'before',
			match: /Second line/,
		},
		fileBefore: dedent`
			First line
			Second line
			Third line
		`,
		fileAfter: dedent`
			Second line
			Third line
		`,
	},
	'removes multiple lines before another line': {
		operation: {
			type: 'remove-line',
			position: 'before',
			match: /Fourth line/,
			count: 2,
		},
		fileBefore: dedent`
			First line
			Second line
			Third line
			Fourth line
			Fifth line
		`,
		fileAfter: dedent`
			First line
			Fourth line
			Fifth line
		`,
	},
	'removes multiple lines before another line even if the count is too big': {
		operation: {
			type: 'remove-line',
			position: 'before',
			match: /Fourth line/,
			count: 10,
		},
		fileBefore: dedent`
			First line
			Second line
			Third line
			Fourth line
			Fifth line
		`,
		fileAfter: dedent`
			Fourth line
			Fifth line
		`,
	},
	'adds a line after another line': {
		operation: {
			type: 'add-line',
			position: 'after',
			match: /First line/,
			lines: 'New line',
		},
		fileBefore: dedent`
			First line
			Second line
			Third line
		`,
		fileAfter: dedent`
			First line
			New line
			Second line
			Third line
		`,
	},
	'adds a line after the last line': {
		operation: {
			type: 'add-line',
			position: 'after',
			match: /Third line/,
			lines: 'New line',
		},
		fileBefore: dedent`
			First line
			Second line
			Third line
		`,
		fileAfter: dedent`
			First line
			Second line
			Third line
			New line
		`,
	},
	'adds a line before another line': {
		operation: {
			type: 'add-line',
			position: 'before',
			match: /Third line/,
			lines: 'New line',
		},
		fileBefore: dedent`
			First line
			Second line
			Third line
		`,
		fileAfter: dedent`
			First line
			Second line
			New line
			Third line
		`,
	},
	'adds a line before the first line': {
		operation: {
			type: 'add-line',
			position: 'before',
			match: /First line/,
			lines: 'New line',
		},
		fileBefore: dedent`
			First line
			Second line
			Third line
		`,
		fileAfter: dedent`
			New line
			First line
			Second line
			Third line
		`,
	},
	'adds multiple lines before the first line': {
		operation: {
			type: 'add-line',
			position: 'before',
			match: /First line/,
			lines: ['New line 1', 'New line 2'],
		},
		fileBefore: dedent`
			First line
			Second line
			Third line
		`,
		fileAfter: dedent`
			New line 1
			New line 2
			First line
			Second line
			Third line
		`,
	},
	"adds a line after another line and keeps the matched line's indentation (default)": {
		operation: {
			type: 'add-line',
			position: 'after',
			match: /Second line/,
			lines: 'New line',
		},
		fileBefore: dedent`
			First line
				Second line
				Third line
			Fourth line
		`,
		fileAfter: dedent`
			First line
				Second line
				New line
				Third line
			Fourth line
		`,
	},
	"adds a line before another line and keeps the matched line's indentation (default)": {
		operation: {
			type: 'add-line',
			position: 'before',
			match: /Second line/,
			lines: 'New line',
		},
		fileBefore: dedent`
			First line
				Second line
				Third line
			Fourth line
		`,
		fileAfter: dedent`
			First line
				New line
				Second line
				Third line
			Fourth line
		`,
	},
	'adds a line after another line and use the specified amount of spaces to indent': {
		operation: {
			type: 'add-line',
			position: 'after',
			match: /Second line/,
			lines: 'New line',
			indent: 4,
		},
		fileBefore: dedent`
			First line
				Second line
				Third line
			Fourth line
		`,
		fileAfter: dedent`
			First line
				Second line
			    New line
				Third line
			Fourth line
		`,
	},
	'adds a line after another line and use the specified string to indent': {
		operation: {
			type: 'add-line',
			position: 'after',
			match: /Second line/,
			lines: 'New line',
			indent: ' > ',
		},
		fileBefore: dedent`
			First line
				Second line
				Third line
			Fourth line
		`,
		fileAfter: dedent`
			First line
				Second line
			 > New line
				Third line
			Fourth line
		`,
	},
	'adds a line after another line and do not indent': {
		operation: {
			type: 'add-line',
			position: 'after',
			match: /Second line/,
			lines: 'New line',
			indent: false,
		},
		fileBefore: dedent`
			First line
				Second line
				Third line
			Fourth line
		`,
		fileAfter: dedent`
			First line
				Second line
			New line
				Third line
			Fourth line
		`,
	},
}

for (const [name, test] of Object.entries(map)) {
	const callback = async() => await usingSandbox({
		fn: async({ targetDirectory }, makeTestPreset) => {
			const { executePreset } = await makeTestPreset({
				handler: async() => await editFile({ file: testFile, operations: [test.operation] }),
			})

			await executePreset()
			await expectStructureMatches(targetDirectory, {
				[testFile]: {
					type: 'file',
					content: test.fileAfter,
				},
			})
		},
		targetStructure: {
			[testFile]: {
				type: 'file',
				content: test.fileBefore,
			},
		},
	})

	if (test.skip === true) {
		it.skip(name, async() => {})
		continue
	}

	if (test.only === true) {
		it.only(name, callback)
		continue
	}

	it(name, callback)
}
