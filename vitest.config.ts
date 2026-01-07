import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
	test: {
		include: ['src/tests/**/*.{test,spec}.{js,ts}'],
		environment: 'node',
		globals: false,
		testTimeout: 10000,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			reportsDirectory: './coverage',
			include: ['src/lib/**/*.ts'],
			exclude: [
				'src/lib/server/db/seed.ts',
				'src/lib/server/db/schema.ts',
				'**/*.d.ts'
			],
			// Realistic thresholds - increase incrementally as coverage improves
			thresholds: {
				lines: 5,
				functions: 5,
				branches: 5,
				statements: 5
			}
		}
	},
	resolve: {
		alias: {
			'$lib': resolve(__dirname, './src/lib')
		}
	}
});

