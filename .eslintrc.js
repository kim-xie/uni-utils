module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  settings: {
    jest: { version: 26 },
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'prettier', // 使得@typescript-eslint中的样式规范失效，遵循prettier中的样式规范
    'plugin:prettier/recommended', // 使用prettier中的样式规范
  ],
  parser: '@typescript-eslint/parser', // ESLint的解析器,用于解析typescript,检查和规范Typescript代码
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  // 检测Typescript代码的规范
  plugins: ['@typescript-eslint', 'jest'],
  rules: {
    'no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }],
    'no-console': 'off',
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/explicit-function-return-type': [
      'off',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      },
    ],
    '@typescript-eslint/no-explicit-any': 0, // 特殊情况可将类型显示设置为any
    '@typescript-eslint/interface-name-prefix': 0, // 允许接口命名以I开头
    '@typescript-eslint/no-use-before-define': 0, // mapStateToProps在之前就用到(typeof推断类型)
    '@typescript-eslint/camelcase': 0, // 驼峰命名格式
    '@typescript-eslint/no-empty-function': 0, // 给函数默认值可以为空
    '@typescript-eslint/no-non-null-assertion': 0, // 允许用！断言不为空
  },
};
