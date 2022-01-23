declare global {
	const definePreset: typeof import('@preset/core')['definePreset']
	const applyNestedPreset: typeof import('@preset/core')['applyNestedPreset']
	const deletePaths: typeof import('@preset/core')['deletePaths']
	const executeCommand: typeof import('@preset/core')['executeCommand']
	const extractTemplates: typeof import('@preset/core')['extractTemplates']
	const group: typeof import('@preset/core')['group']
	const installPackages: typeof import('@preset/core')['installPackages']
	const prompt: typeof import('@preset/core')['prompt']
}
export {}
