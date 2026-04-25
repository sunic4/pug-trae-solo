module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'trailing-comma': ['error', 'es5'],
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'linebreak-style': ['error', 'unix'],
    'no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 1 }],
    'no-trailing-spaces': 'error',
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'always'],
    'space-infix-ops': 'error',
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', 'never'],
  },
};
