import { deletePaths, DeletePathOptions } from '../../src'
import { DirectoryStructure, expectStructureMatches, testsInSandbox, TestRecord } from '../utils'

interface DeletePathTest extends TestRecord {
	options: DeletePathOptions
	initialStructure: DirectoryStructure
	finalStructure: DirectoryStructure
}

const tests: Record<string, DeletePathTest> = {
	'deletes a single file at the root': {
		options: { paths: 'file-to-delete.txt' },
		initialStructure: {
			'file.txt': { type: 'file' },
			'file-to-delete.txt': { type: 'file' },
		},
		finalStructure: {
			'file.txt': { type: 'file' },
			'file-to-delete.txt': { type: 'none' },
		},
	},

	'deletes multiple files at the root': {
		options: { paths: ['file-to-delete1.txt', 'file-to-delete2.txt'] },
		initialStructure: {
			'file.txt': { type: 'file' },
			'file-to-delete1.txt': { type: 'file' },
			'file-to-delete2.txt': { type: 'file' },
		},
		finalStructure: {
			'file.txt': { type: 'file' },
			'file-to-delete1.txt': { type: 'none' },
			'file-to-delete2.txt': { type: 'none' },
		},
	},

	'deletes files with globs': {
		options: { paths: '**/*.txt' },
		initialStructure: {
			'file.txt': { type: 'file' },
			'config.yaml': { type: 'file' },
			'nested/nested-file.txt': { type: 'file' },
			'nested/nested-config.yaml': { type: 'file' },
		},
		finalStructure: {
			'file.txt': { type: 'none' },
			'config.yaml': { type: 'file' },
			'nested/nested-file.txt': { type: 'none' },
			'nested/nested-config.yaml': { type: 'file' },
		},
	},

	'deletes multiple files with globs': {
		options: { paths: ['**/*.txt', '**/*.yaml'] },
		initialStructure: {
			'file.txt': { type: 'file' },
			'config.yaml': { type: 'file' },
			'nested/nested-file.txt': { type: 'file' },
			'nested/nested-config.yaml': { type: 'file' },
		},
		finalStructure: {
			'file.txt': { type: 'none' },
			'config.yaml': { type: 'none' },
			'nested/nested-file.txt': { type: 'none' },
			'nested/nested-config.yaml': { type: 'none' },
		},
	},
}

testsInSandbox(tests, (test) => ({
	fn: async({ targetDirectory }, makeTestPreset) => {
		const { executePreset } = await makeTestPreset({
			handler: async() => await deletePaths(test.options),
		})

		await executePreset()
		await expectStructureMatches(targetDirectory, test.finalStructure)
	},
	targetStructure: test.initialStructure,
}))
