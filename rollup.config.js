import path from 'path';
import typescript from 'rollup-plugin-typescript2';
import babel, { getBabelOutputPlugin } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { eslint } from 'rollup-plugin-eslint';
import { DEFAULT_EXTENSIONS } from '@babel/core';
import { terser } from 'rollup-plugin-terser';
// 按需打包nodejs内置模块  尽可能少用node模块 node-builtins可能会引入过多的代码
// import builtins from 'rollup-plugin-node-builtins';
// import globals from 'rollup-plugin-node-globals';

import pkg from './package.json';

const paths = {
  input: path.join(__dirname, '/src/index.ts'),
  output: path.join(__dirname, '/dist'),
};

// tsconfig配置重写
const tsconfigOverride = {
  include: ['src'],
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
      plugins: [
        getBabelOutputPlugin({
          configFile: path.resolve(__dirname, 'babel.config.json'),
        }),
      ],
    },
    // 输出 umd 规范的代码
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

    // 解析第三方模块 -- Must be before rollup-plugin-typescript2 in the plugin list, especially when browser: true option is used
    nodeResolve({
      jsnext: true, // 该属性是指定将Node包转换为ES2015模块
      // main 和 browser 属性将使插件决定将那些文件应用到bundle中
      main: true, // Default: true
      browser: true, // Default: false
    }),

    // CommonJS 模块转换为 ES2015
    commonjs(),

    // 验证导入的文件 a .eslintrc.* file in your project's root. It will be loaded automatically.
    eslint({
      throwOnError: true, // lint 结果有错误将会抛出异常
      throwOnWarning: true,
      include: ['src/*.ts'],
      exclude: ['node_modules/**', 'dist/**', 'test/**', 'docs/**', 'typedocs/**'],
    }),

    // babel处理 @rollup/plugin-commonjs must be placed before this plugin in the plugins
    babel({
      babelHelpers: 'runtime',
      // 只转换源代码，不运行外部依赖
      exclude: 'node_modules/**',
      // babel 默认不支持 ts 需要手动添加
      extensions: [...DEFAULT_EXTENSIONS, '.ts'],
    }),

    // ts处理  .ts -> tsc -> babel -> es5
    typescript({
      tsconfig: 'tsconfig.json',
      tsconfigOverride,
    }),

    // 代码压缩
    terser(),
  ],
};

export default rollupConfig;
