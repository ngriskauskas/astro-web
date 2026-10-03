import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist', 'playwright-report', 'test-results']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // Playwright fixtures call a parameter named `use`, which is not the React hook.
    files: ['tests/e2e/**/*.ts', 'tests/review/**/*.ts'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  {
    // Test helpers export a mix of components and functions and are never hot-reloaded.
    files: ['tests/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
