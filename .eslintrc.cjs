/** @type {import('eslint').Linter.Config} */
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier'
	],
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2022,
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2022: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	],
	rules: {
		// TypeScript specific
		'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-non-null-assertion': 'warn',

		// General
		'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
		'prefer-const': 'error',
		'no-var': 'error',
		'eqeqeq': ['error', 'always'],

		// Svelte specific
		'svelte/no-at-html-tags': 'warn',
		'svelte/valid-compile': 'error'
	},
	ignorePatterns: [
		'node_modules',
		'.svelte-kit',
		'build',
		'dist',
		'*.config.js',
		'*.config.ts'
	]
};
