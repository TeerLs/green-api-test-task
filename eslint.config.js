import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import importX from 'eslint-plugin-import-x'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared']
const SLICED_LAYERS = ['pages', 'widgets', 'features', 'entities']

const publicApiPattern = {
  group: SLICED_LAYERS.map((layer) => `@/${layer}/*/*`),
  message: 'FSD: импортируйте слайс только через его публичный API (index.ts).',
}

const fsdBoundaries = LAYERS.map((layer, index) => {
  const upperLayers = LAYERS.slice(0, index)
  const patterns = [publicApiPattern]
  if (upperLayers.length > 0) {
    patterns.push({
      group: upperLayers.flatMap((upper) => [`@/${upper}`, `@/${upper}/*`]),
      message: `FSD: слой "${layer}" может импортировать только нижележащие слои.`,
    })
  }
  return {
    files: [`src/${layer}/**/*.{ts,tsx}`],
    rules: { 'no-restricted-imports': ['error', { patterns }] },
  }
})

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'playwright-report', 'test-results']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    plugins: { 'import-x': importX },
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.browser },
    },
    settings: {
      'import-x/internal-regex': '^@/',
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
      'import-x/no-duplicates': 'error',
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    },
  },
  ...fsdBoundaries,
  {
    files: ['src/shared/ui/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'jest.setup.ts', 'e2e/**/*.ts'],
    languageOptions: { globals: { ...globals.jest, ...globals.node } },
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['*.config.{js,ts}'],
    languageOptions: { globals: { ...globals.node } },
  },
  prettierRecommended,
])
