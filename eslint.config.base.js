const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');

module.exports = defineConfig(
  {
    ignores: [
      '**/.history/**',
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.d.ts',
      '.prettierrc.js',
      'eslint.config.js',
      'eslint.config.base.js',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  require('eslint-config-prettier'),
);
