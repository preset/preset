import { defineConfig } from 'vite'

export default defineConfig({
	test: {
		pool: 'threads',
		poolOptions: {
			threads: {
				singleThread: true,
			},
		},
		reporters: 'verbose',
		include: ['**/*.test.ts'],
		watch: false,
		testTimeout: 60 * 1000,
	},
})
