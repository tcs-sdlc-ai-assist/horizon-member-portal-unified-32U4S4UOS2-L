module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: '18.3',
    },
  },
  plugins: ['react', 'react-hooks', 'react-refresh'],
  rules: {
    // React Refresh
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],

    // React rules
    'react/prop-types': 'warn',
    'react/jsx-no-target-blank': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-unescaped-entities': 'warn',
    'react/no-array-index-key': 'warn',
    'react/self-closing-comp': ['warn', { component: true, html: true }],
    'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
    'react/jsx-boolean-value': ['warn', 'never'],
    'react/no-unused-state': 'warn',
    'react/jsx-no-constructed-context-values': 'warn',
    'react/hook-use-state': 'warn',

    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Accessibility rules (jsx-a11y equivalent enforcement without plugin)
    'react/jsx-no-script-url': 'error',

    // Code quality
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'warn',
    'no-var': 'error',
    'prefer-const': 'warn',
    'prefer-template': 'warn',
    'no-duplicate-imports': 'error',
    'no-self-compare': 'error',
    'no-template-curly-in-string': 'warn',
    'no-unmodified-loop-condition': 'warn',
    'no-unreachable-loop': 'error',
    'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
    'eqeqeq': ['error', 'always'],
    'curly': ['warn', 'multi-line'],
    'default-case': 'warn',
    'dot-notation': 'warn',
    'no-else-return': ['warn', { allowElseIf: false }],
    'no-empty-function': 'warn',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-lone-blocks': 'warn',
    'no-multi-str': 'warn',
    'no-new-wrappers': 'error',
    'no-param-reassign': ['warn', { props: false }],
    'no-return-assign': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-useless-concat': 'warn',
    'no-useless-return': 'warn',
    'prefer-arrow-callback': 'warn',
    'prefer-destructuring': ['warn', { object: true, array: false }],
    'prefer-rest-params': 'error',
    'prefer-spread': 'warn',
    'object-shorthand': ['warn', 'always'],
    'arrow-body-style': ['warn', 'as-needed'],
    'no-nested-ternary': 'warn',
    'spaced-comment': ['warn', 'always'],
  },
}