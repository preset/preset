import type { ActionContext, PresetContext } from '@preset/core'

export const contexts: PresetContext[] = []

export function getParentContext(actionContext: ActionContext) {
	return contexts.find(({ id }) => actionContext.presetContextId === id)
}
