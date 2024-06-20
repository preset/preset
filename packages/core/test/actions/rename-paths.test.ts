import { type RenamePathsOptions, renamePaths } from '../../src'
import { type DirectoryStructure, type TestRecord, expectStructureMatches, testsInSandbox } from '../utils'

interface RenamePathTest extends TestRecord {
	options: RenamePathsOptions
	initialStructure: DirectoryStructure
	finalStructure: DirectoryStructure
}

const fixedDate = new Date('2013-03-10T02:00:00Z').toISOString().substring(0, 10)

const tests: Record<string, RenamePathTest> = {
	'renames a single file at the root': {
		options: { paths: 'file-to-rename.txt', transformer: 'renamed-file.txt' },
		initialStructure: {
			'file-to-rename.txt': { type: 'file' },
		},
		finalStructure: {
			'file-to-rename.txt': { type: 'none' },
			'renamed-file.txt': { type: 'file' },
		},
	},

	'renames a single file at the root and changes the file extension via mutating function': {
		options: {
			paths: 'blog-post.md',
			transformer: ({ name }) => `${fixedDate}-${name}.mdx`,
		},
		initialStructure: {
			'blog-post.md': { type: 'file' },
		},
		finalStructure: {
			'blog-post.md': { type: 'none' },
			'2013-03-10-blog-post.mdx': { type: 'file' },
		},
	},

	'renames multiple files at the root': {
		options: {
			paths: ['_file-to-rename1.txt', '_file-to-rename2.txt'],
			transformer: ({ base }) => `test-${base.slice(1)}`,
		},
		initialStructure: {
			'file.txt': { type: 'file' },
			'_file-to-rename1.txt': { type: 'file' },
			'_file-to-rename2.txt': { type: 'file' },
		},
		finalStructure: {
			'file.txt': { type: 'file' },
			'_file-to-rename1.txt': { type: 'none' },
			'_file-to-rename2.txt': { type: 'none' },
			'test-file-to-rename1.txt': { type: 'file' },
			'test-file-to-rename2.txt': { type: 'file' },
		},
	},

	'renames a single directory at the root': {
		options: { paths: 'directory-to-rename', transformer: 'renamed-directory' },
		initialStructure: {
			'directory-to-rename': { type: 'directory' },
		},
		finalStructure: {
			'directory-to-rename': { type: 'none' },
			'renamed-directory': { type: 'directory' },
		},
	},

	'renames a single directory with an extension like name at the root': {
		options: { paths: 'directory-to-rename.txt', transformer: 'renamed-directory' },
		initialStructure: {
			'directory-to-rename.txt': { type: 'directory' },
		},
		finalStructure: {
			'directory-to-rename.txt': { type: 'none' },
			'renamed-directory': { type: 'directory' },
		},
	},

	'renames files with globs via mutating function': {
		options: {
			paths: '**/*.txt',
			transformer: ({ base }) => `test-${base}`,
		},
		initialStructure: {
			'file.txt': { type: 'file' },
			'config.yaml': { type: 'file' },
			'nested/nested-file.txt': { type: 'file' },
			'nested/nested-config.yaml': { type: 'file' },
		},
		finalStructure: {
			'file.txt': { type: 'none' },
			'test-file.txt': { type: 'file' },
			'config.yaml': { type: 'file' },
			'nested/nested-file.txt': { type: 'none' },
			'nested/test-nested-file.txt': { type: 'file' },
			'nested/nested-config.yaml': { type: 'file' },
		},
	},
}

testsInSandbox(tests, (test) => ({
	fn: async ({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({
			handler: async () => await renamePaths(test.options),
		})

		await executePreset()
		await expectStructureMatches(targetDirectory, test.finalStructure)
	},
	targetStructure: test.initialStructure,
}))
