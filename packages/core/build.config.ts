import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
	entries: ['./src/index'],
	clean: true,
	declaration: true,
	failOnWarn: false, // globals.d.ts is generated dynamically
	externals: [
		'esbuild',
	],
	rollup: {
		emitCJS: true,
		cjsBridge: true,
		inlineDependencies: true,
	},
})
