# 介绍

kim-uni-utils 是一个 TypeScript Utils 包

## 1. 如何使用

**安装:**

```shell
yarn add kim-uni-utils
```

or

```shell
npm install kim-uni-utils
```

**三种使用方式:**

```js
// 方式1: import
import { is } from 'kim-uni-utils'
console.log(is.isArray([1,2,3]))

// 方式2: require
const { is } = require('kim-uni-utils')
console.log(is.isArray([1,2,3]))

// 方式3: 在 HTML 文件中使用 script 标签加载，此时会在 window 上挂载一个 kim-uni-utils 的变量
<script src="node_modules/kim-uni-utils/dist/bundle.browser.js"></script>
<script>
  console.log(kim-uni-utils.is.isArray([1,2,3]))
</script>
```

## 2、开发指南

```markdown
1、工程按功能模块划分 (如：图片相关: src/image.ts, 环境相关: src/env.ts)

2、对方法进行必要的注释 (请参考 tsdoc 注释模板 [API](https://tsdoc.org/pages/tags/alpha/))

3、开发时遵循统一标准规范（editorconfig\eslint\prettier）

4、进行必要的单元测试（test/X.X.ts）

5、npm run startTypeDoc 查看实时文档（根据注释生成文档）

6、npm run build 打包 & 生成文档

7、npm run docs:dev 查看打包后对应生成的文档

8、npm run docs:build 构建线上文档

9、遵循@commitlint/config-angular 代码提交规范
```
