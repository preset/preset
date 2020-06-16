import typescript from '@rollup/plugin-typescript';

export default {
	input: ['src/index.ts', 'src/cli.ts'],
	output: {
		dir: 'dist',
		format: 'cjs',
	},
	plugins: [typescript()],
};
