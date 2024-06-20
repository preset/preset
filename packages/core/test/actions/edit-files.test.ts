import { type EditFileOperation, editFiles } from '../../src'
import { type DirectoryStructure, type TestRecord, dedent, expectStructureMatches, testsInSandbox } from '../utils'

interface EditFileTest extends TestRecord {
	operation: EditFileOperation
	fileBefore?: string
	fileAfter?: string
	files?: string | string[]
	initialStructure?: DirectoryStructure
	finalStructure?: DirectoryStructure
}

const testFile = 'file.txt'
const tests: Record<string, EditFileTest> = {
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
	'removes the line that matches': {
		operation: {
			type: 'remove-line',
			match: /First line/,
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
	'removes the line that matches at a non-zero index': {
		operation: {
			type: 'remove-line',
			match: /Second line/,
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
	'removes the line that matches and two of the following ones': {
		operation: {
			type: 'remove-line',
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
			Fourth line
		`,
	},
	'removes multiple lines after another line even if the count is too big': {
		operation: {
			type: 'remove-line',
			match: /Third line/,
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
	'removes the matched line by default': {
		operation: {
			type: 'remove-line',
			match: /Second line/,
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
	'removes two lines before another line': {
		operation: {
			type: 'remove-line',
			match: /Fourth line/,
			start: -2,
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
	'removes the line before with negative start': {
		operation: {
			type: 'remove-line',
			match: /Fourth line/,
			start: -1,
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
			Second line
			Fourth line
			Fifth line
		`,
	},
	'removes the line and the one before with negative start and a count of two': {
		operation: {
			type: 'remove-line',
			match: /Fourth line/,
			start: -1,
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
			Second line
			Fifth line
		`,
	},
	'adds a line to the specified index': {
		operation: {
			type: 'add-line',
			position: 2,
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
	'updates content in multiple files': {
		files: '*.txt',
		operation: {
			type: 'update-content',
			update: (content) => content.replaceAll('l', 'w'),
		},
		initialStructure: {
			'hello.txt': { type: 'file', content: 'Hello' },
			'world.txt': { type: 'file', content: 'world' },
		},
		finalStructure: {
			'hello.txt': { type: 'file', content: 'Hewwo' },
			'world.txt': { type: 'file', content: 'worwd' },
		},
	},
	'prepends a line to a file': {
		operation: {
			type: 'add-line',
			position: 'prepend',
			lines: 'New line',
		},
		fileBefore: dedent`
			First line
			Second line
		`,
		fileAfter: dedent`
			New line
			First line
			Second line
		`,
	},
	'appends a line to a file': {
		operation: {
			type: 'add-line',
			position: 'append',
			lines: 'New line',
		},
		fileBefore: dedent`
			First line
			Second line
		`,
		fileAfter: dedent`
			First line
			Second line
			New line
		`,
	},
	'merges json to a json file': {
		operation: {
			type: 'edit-json',
			merge: {
				preset: 'preset.ts',
				devDependencies: {
					'@preset/core': '*',
				},
				files: ['dist'],
			},
		},
		fileBefore: JSON.stringify({ private: true, files: ['src'] }),
		fileAfter: JSON.stringify({
			private: true,
			files: ['src', 'dist'],
			preset: 'preset.ts',
			devDependencies: { '@preset/core': '*' },
		}),
	},
	'replaces a json file with a callback': {
		operation: {
			type: 'edit-json',
			replace: (json, omit) => ({
				...json,
				dependencies: {
					...omit(json.dependencies, 'eslint', 'typescript'),
				},
				devDependencies: {
					eslint: json.dependencies.eslint,
					typescript: json.dependencies.typescript,
					...json.devDependencies,
				},
			}),
		},
		fileBefore: JSON.stringify({
			private: true,
			files: ['src'],
			dependencies: {
				vue: '^3.0.0',
				eslint: '^8.7.0',
				typescript: '^4.5.4',
			},
			devDependencies: {
				'@preset/core': '*',
			},
		}),
		fileAfter: JSON.stringify({
			private: true,
			files: ['src'],
			dependencies: {
				vue: '^3.0.0',
			},
			devDependencies: {
				'eslint': '^8.7.0',
				'typescript': '^4.5.4',
				'@preset/core': '*',
			},
		}),
	},
	'deletes properties from a json file': {
		operation: {
			type: 'edit-json',
			delete: ['devDependencies.@preset/core', 'preset'],
		},
		fileBefore: JSON.stringify({
			private: true,
			files: ['src', 'dist'],
			preset: 'preset.ts',
			devDependencies: {
				'@preset/core': '*',
				'debug': '^4.3.4',
			},
		}),
		fileAfter: JSON.stringify({
			private: true,
			files: ['src', 'dist'],
			devDependencies: {
				debug: '^4.3.4',
			},
		}),
	},
	'keeps json indent': {
		operation: {
			type: 'edit-json',
			delete: ['devDependencies.@preset/core'],
		},
		fileBefore: JSON.stringify({
			private: true,
			devDependencies: {
				'@preset/core': '*',
				'debug': '^4.3.4',
			},
		}, null, '  '),
		fileAfter: JSON.stringify({
			private: true,
			devDependencies: {
				debug: '^4.3.4',
			},
		}, null, '  '),
	},
	'skips operation on condition': {
		operation: {
			type: 'edit-json',
			delete: ['foo'],
			skipIf: (content) => content.includes('foo'),
		},
		fileBefore: JSON.stringify({
			foo: 'bar',
		}),
		fileAfter: JSON.stringify({
			foo: 'bar',
		}),
	},
}

testsInSandbox(tests, (test) => ({
	fn: async ({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({
			handler: async () => await editFiles({
				files: test.files ?? testFile,
				operations: [test.operation],
			}),
		})

		await executePreset()
		await expectStructureMatches(targetDirectory, test.finalStructure ?? {
			[testFile]: {
				type: 'file',
				content: test.fileAfter,
			},
		})
	},
	targetStructure: test.initialStructure ?? {
		[testFile]: {
			type: 'file',
			content: test.fileBefore,
		},
	},
}))
