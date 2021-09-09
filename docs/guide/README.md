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
