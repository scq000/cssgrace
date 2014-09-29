
# CSS Grace

  >**从今天起，写简单优雅面向未来的 CSS。**

--------------

CSS Grace 是一个由 Node.js 驱动，面向未来的 CSS 后处理工具，Sass/Less 能做的 CSS Grace 也能做，他们不能的，CSS Grace 也可以。最重要的是不改变 CSS 原生的语法，让 CSS 写起来更简单，更优雅。

文档推荐看这个排版更好：http://jie.alidemo.cn/cssgrace/

![CSS Grace 动画演示](http://gtms03.alicdn.com/tps/i3/TB1OXJaGpXXXXbbXFXXZ.oU0pXX-848-504.gif)

## 快速开始

1. 下载并安装 Node.js

2. 新建一个目录，比如 test ，在命令行中切换到该目录，安装 cssgrace。

  ```
  npm install cssgrace
  ```

3. 在 test 目录新增一个 test.js，代码如下：

  ```
  var fs = require("fs");
  var cssgrace = require('cssgrace');

  var css = fs.readFileSync('input.css', 'utf8');
  fs.writeFileSync('output.css', cssgrace(css));
  ```

4. 在 test 目录新增一个 input.css, 注意编码要和 ```fs.readFileSync``` 中的保持一致。输入测试的CSS代码片段，比如：

  ```css
  .foo::after {
    position: center;
    width: 110px;
    height: 23em;
    background: rgba(0, 26, 0, .3);
  }
  ```

5. 在命令行中执行 ```npm test```，快去看看 output.css 中发生了什么吧！



## 面向未来的 CSS 工作流

  1. 使用 [Autoprefixer](https://github.com/postcss/autoprefixer) 自动增加前缀，抛弃 Sass/Less 繁杂且不健全的前缀 mixin。
  2. 使用 PostCSS 的一系列CSS 未来语法插件支持 CSS 原生变量（[postcss-custom-properties](https://github.com/postcss/postcss-custom-properties)）等。
  3. 使用 CSS Grace 自动优化代码，兼容低版本 IE。
  4. 使用 [CSSLint](https://github.com/CSSLint) 检查 CSS 语法。
  5. 使用 [clean-css](https://github.com/jakubpawlowicz/clean-css) 或 [CKStyle](https://github.com/wangjeaf/ckstyle-node)压缩合并 CSS 文件。


## 致谢

CSS Grace 基于 [PostCSS](https://github.com/postcss/postcss)，感谢 Andrey Sitnik 开发了这么好的 CSS 解析器以及在本插件开发过程中给予帮助。


## Licence

MIT
