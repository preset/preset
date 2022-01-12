import { defineConfig } from 'vite'

export default defineConfig({
	test: {
		threads: false,
		reporters: 'verbose',
		include: ['**/*.test.ts'],
		watch: false,
		testTimeout: 60 * 1000,
	},
})
