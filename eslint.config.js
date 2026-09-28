import neostandard from 'neostandard';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'public/'] },
  ...neostandard({ semi: true, noJsx: true }),
  {
    languageOptions: {
      globals: { ...globals.browser, Phaser: 'readonly' }
    },
    rules: {
      'no-cond-assign': ['error', 'except-parens'],
      'no-duplicate-case': 'error',
      'accessor-pairs': 'error',
      curly: 'error',
      eqeqeq: ['error', 'smart'],
      'no-alert': 'error',
      'no-caller': 'error',
      'no-console': ['error', { allow: ['warn', 'log'] }],
      'no-invalid-this': 'error',
      'no-multi-str': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-redeclare': 'error',
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      yoda: ['error', 'never'],
      camelcase: 'error',
      'consistent-this': ['error', '_this'],
      'no-array-constructor': 'error',
      'no-lonely-if': 'error',

      '@stylistic/no-floating-decimal': 'error',
      '@stylistic/no-multi-spaces': 'error',
      '@stylistic/block-spacing': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/comma-dangle': ['error', 'never'],
      '@stylistic/comma-style': ['error', 'last'],
      '@stylistic/computed-property-spacing': ['error', 'never'],
      '@stylistic/eol-last': 'error',
      '@stylistic/function-call-spacing': ['error', 'never'],
      '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
      '@stylistic/key-spacing': ['error', { beforeColon: false, afterColon: true }],
      '@stylistic/lines-around-comment': ['error', {
        beforeBlockComment: true,
        afterBlockComment: false,
        beforeLineComment: false,
        afterLineComment: false,
        allowBlockStart: true,
        allowBlockEnd: false,
        allowObjectStart: true,
        allowArrayStart: true
      }],
      '@stylistic/space-before-function-paren': 'off',
      '@stylistic/new-parens': 'error',
      '@stylistic/no-mixed-spaces-and-tabs': 'error',
      '@stylistic/no-trailing-spaces': ['error', { skipBlankLines: true, ignoreComments: true }],
      '@stylistic/no-whitespace-before-property': 'error',
      '@stylistic/object-curly-newline': ['error', { multiline: true, minProperties: 1 }],
      '@stylistic/one-var-declaration-per-line': ['error', 'initializations'],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi-spacing': ['error', { before: false, after: true }],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/space-before-blocks': 'error',
      '@stylistic/space-in-parens': ['error', 'never'],
      '@stylistic/space-infix-ops': ['error', { int32Hint: true }],
      '@stylistic/wrap-regex': 'error',
      '@stylistic/spaced-comment': ['error', 'always', { block: { balanced: true, exceptions: ['*', '!'] } }]
    }
  }
];
