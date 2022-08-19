import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
	entries: ['./src/cli'],
	clean: true,
	failOnWarn: false,
	rollup: {
		cjsBridge: true,
	},
})
