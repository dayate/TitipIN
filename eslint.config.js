import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
	js.configs.recommended,
	prettier,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module'
			}
		},
		plugins: {
			'@typescript-eslint': tsPlugin
		},
		rules: {
			...tsPlugin.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-non-null-assertion': 'off', // Common in SvelteKit
			'no-unused-vars': 'off' // Use TypeScript version instead
		}
	},
	...svelte.configs['flat/recommended'],
	...svelte.configs['flat/prettier'],
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: tsParser
			}
		},
		rules: {
			// Svelte 5 uses let for reactive variables, not const
			'prefer-const': 'off',
			'no-unused-vars': 'off',
			// Navigation rules not needed for standard SvelteKit
			'svelte/no-navigation-without-resolve': 'off',
			// Each key is optional - not critical
			'svelte/require-each-key': 'off',
			'svelte/no-at-html-tags': 'warn',
			'svelte/valid-compile': 'warn' // Changed to warn for flexibility
		}
	},
	{
		rules: {
			// General rules - relaxed for pragmatic development
			'no-console': 'off', // Console is fine for development
			'prefer-const': 'off', // Conflicts with Svelte 5 reactive patterns
			'no-var': 'error',
			'eqeqeq': ['warn', 'smart'], // Allow == for null checks
			'no-unused-vars': 'off' // Handled by TypeScript
		}
	},
	{
		ignores: [
			'.svelte-kit/',
			'node_modules/',
			'build/',
			'dist/',
			'*.config.js',
			'*.config.ts',
			'coverage/',
			'tests/',
			'src/tests/'
		]
	}
];


