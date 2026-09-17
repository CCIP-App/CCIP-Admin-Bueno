import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import importX from 'eslint-plugin-import-x'
import node from 'eslint-plugin-n'
import promise from 'eslint-plugin-promise'
import vue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  { ignores: ['dist/**'] },
  js.configs.recommended,
  ...vue.configs['flat/essential'],
  stylistic.configs.customize({
    semi: false,
    quotes: 'single',
    commaDangle: 'never',
    braceStyle: '1tbs'
  }),
  {
    plugins: { 'import-x': importX, n: node, promise },
    languageOptions: { globals: globals.node },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none', ignoreRestSiblings: true }],
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      '@stylistic/arrow-parens': 'off',
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/space-before-function-paren': ['error', 'always'],
      '@stylistic/operator-linebreak': ['error', 'before', { overrides: { '=': 'after' } }],
      'vue/multi-word-component-names': 'off',
      'import-x/export': 'error',
      'import-x/first': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-webpack-loader-syntax': 'error',
      'n/handle-callback-err': ['error', '^(err|error)$'],
      'n/no-deprecated-api': 'error',
      'n/no-exports-assign': 'error',
      'n/no-new-require': 'error',
      'n/no-path-concat': 'error',
      'n/process-exit-as-throw': 'error',
      'promise/param-names': 'error'
    }
  },
  {
    files: ['src/**/*.{js,vue}'],
    languageOptions: { globals: globals.browser }
  }
]
