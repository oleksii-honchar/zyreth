const globals = require('globals');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const eslintPrettier = require('eslint-plugin-prettier');

const eslintConfigBase = require('../../eslint.config.base');

module.exports = defineConfig(...eslintConfigBase, {
  files: ['src/**/*.ts'],
  plugins: {
    'typescript-eslint': tseslint.plugin,
    prettier: eslintPrettier,
  },
  languageOptions: {
    ecmaVersion: 'latest',
    parser: tseslint.parser,
    parserOptions: {
      project: true,
      tsconfigRootDir: __dirname,
    },
    sourceType: 'module',
    globals: {
      ...globals.node,
    },
  },
  rules: {
    'prettier/prettier': 'error',
  },
});
