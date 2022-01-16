import { it, expect } from 'vitest'
import { group, extractTemplates, executeCommand, emitter, ActionContext } from '../../src'
import { usingSandbox } from '../utils'

it('applies actions in the group', async() => await usingSandbox({
	fn: async(_, makeTestPreset) => {
		const actions: ActionContext[] = []
		const { executePreset } = await makeTestPreset({
			handler: async() => await group({
				handler: async() => {
					await extractTemplates()
				},
			}),
		})

		emitter.on('action:start', (context) => actions.push(context))

		expect(await executePreset()).toBe(true)
		expect(actions[0]).toMatchObject({ groupContextId: undefined, name: 'group', status: 'applied' })
		expect(actions[1]).toMatchObject({ groupContextId: actions[0].id, name: 'extract-templates' })
	},
}))

it('does not mix multiple groups', async() => await usingSandbox({
	fn: async(_, makeTestPreset) => {
		const actions: ActionContext[] = []
		const { executePreset } = await makeTestPreset({
			handler: async() => {
				await group({
					title: 'group 1',
					handler: async() => {
						await extractTemplates()
					},
				})

				await group({
					title: 'group 2',
					handler: async() => {
						await extractTemplates()
					},
				})
			},
		})

		emitter.on('action:start', (context) => actions.push(context))

		expect(await executePreset()).toBe(true)
		expect(actions[0]).toMatchObject({ groupContextId: undefined, title: 'group 1', status: 'applied' })
		expect(actions[1]).toMatchObject({ groupContextId: actions[0].id, name: 'extract-templates' })
		expect(actions[2]).toMatchObject({ groupContextId: undefined, title: 'group 2', status: 'applied' })
		expect(actions[3]).toMatchObject({ groupContextId: actions[2].id, name: 'extract-templates' })
	},
}))

it('fails when sub-action fail', async() => await usingSandbox({
	fn: async(_, makeTestPreset) => {
		const actions: ActionContext[] = []
		const { executePreset } = await makeTestPreset({
			handler: async() => await group({
				handler: async() => {
					await executeCommand({ command: 'me-no-exist' })
				},
			}),
		})

		emitter.on('action:start', (context) => actions.push(context))

		expect(await executePreset()).toBe(false)
		expect(actions[0]).toMatchObject({ groupContextId: undefined, name: 'group', status: 'failed' })
		expect(actions[1]).toMatchObject({ groupContextId: actions[0].id, name: 'execute-command' })
		expect(actions[0].error).toBeDefined()
	},
}))
