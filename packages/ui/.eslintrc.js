/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  // react-hooks + @next/next are registered so inline eslint-disable directives
  // referencing their rules (e.g. @next/next/no-img-element) resolve when this
  // package is linted standalone — apps/web lints these components via `next lint`,
  // but this workspace lints them on its own too.
  plugins: ['@typescript-eslint', 'react-hooks', '@next/next'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: { browser: true, node: false, es2022: true },
  ignorePatterns: ['node_modules', 'dist', 'build', '.next', '.turbo'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    // SVG inline attributes use camelCase — fine in JSX
    '@typescript-eslint/no-require-imports': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
