import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
	test: {
		include: ['src/tests/**/*.{test,spec}.{js,ts}'],
		environment: 'node',
		globals: false,
		testTimeout: 10000
	},
	resolve: {
		alias: {
			'$lib': resolve(__dirname, './src/lib')
		}
	}
});
