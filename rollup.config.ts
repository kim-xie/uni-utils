import path from 'path';
import rollupTypescript from 'rollup-plugin-typescript2';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { eslint } from 'rollup-plugin-eslint';
import { DEFAULT_EXTENSIONS } from '@babel/core';
import { terser } from 'rollup-plugin-terser';
// 按需打包nodejs内置模块
// import builtins from 'rollup-plugin-node-builtins';
// import globals from 'rollup-plugin-node-globals';

import pkg from './package.json';

const paths = {
  input: path.join(__dirname, '/src/index.ts'),
  output: path.join(__dirname, '/dist'),
};

// rollup 配置项
const rollupConfig = {
  input: paths.input,
  output: [
    // 输出 commonjs 规范的代码
    {
      file: pkg.main,
      format: 'cjs',
      name: pkg.name,
    },
    // 输出 es 规范的代码
    {
      file: pkg.module,
      format: 'es',
      name: pkg.name,
    },
    {
      file: pkg.browser,
      format: 'umd',
      name: pkg.name,
    },
  ],
  // plugins 需要注意引用顺序
  plugins: [
    // globals(),
    // builtins(),
    // 验证导入的文件
    eslint({
      throwOnError: true, // lint 结果有错误将会抛出异常
      throwOnWarning: true,
      include: ['src/*.ts', 'scripts/*'],
      exclude: ['node_modules/**', 'dist/**', 'test/**'],
    }),

    // ts处理  .ts -> tsc -> babel -> es5
    rollupTypescript(),

    // babel处理
    babel({
      runtimeHelpers: true,
      // 只转换源代码，不运行外部依赖
      exclude: 'node_modules/**',
      // babel 默认不支持 ts 需要手动添加
      extensions: [...DEFAULT_EXTENSIONS, '.ts'],
    }),

    // 使得 rollup 支持 commonjs 规范，识别 commonjs 规范的依赖
    commonjs(),

    // 配合 commnjs 解析第三方模块
    resolve({
      // 将自定义选项传递给解析插件
      customResolveOptions: {
        moduleDirectory: 'node_modules',
      },
    }),

    // 代码压缩
    terser(),
  ],
};

export default rollupConfig;
