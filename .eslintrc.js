module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    commonjs: true,
    es6: true,
    jest: true
  },
  settings: {
    jest: { version: 26 }
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended'
    // 'plugin:prettier/recommended', // 使用prettier中的样式规范 官方的推荐配置等同于: extends: ['prettier'], plugins:['prettier'], rules: {"prettier/prettier": "error"}
  ],
  parser: '@typescript-eslint/parser', // ESLint的解析器,用于解析typescript,检查和规范Typescript代码
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['dist', 'node_modules', 'test'], // .eslintignore不生效
  rules: {
    // 'prettier/prettier': [2, {}, { usePrettierrc: true }],
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    'jest/expect-expect': 0
  }
}
