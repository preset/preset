import { it, expect } from 'vitest'
import { executeCommand } from '../../src'
import { makeTestPreset } from '../utils'

it('executes a command with arguments and calls a callback per line', async() => {
	const log: string[] = []
	const { executePreset } = await makeTestPreset({
		handler: async() => await executeCommand({
			command: 'echo',
			arguments: ['hello world'],
			data: (line) => log.push(line),
		}),
	})

	expect(await executePreset()).toBe(true)
	expect(log).toMatchObject(['hello world'])
})
