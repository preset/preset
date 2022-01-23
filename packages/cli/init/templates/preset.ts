export default definePreset({
	name: '@@presetName',
	options: {
		// ...
	},
	handler: async() => {
		await extractTemplates()
		// ...
	},
})
