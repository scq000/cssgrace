<div class="main" style="width: 46em; margin: auto;">

# CSS Grace

  >**从今天起，写简单优雅面向未来的 CSS。**

--------------

CSS Grace 是一个面向未来的 CSS 后处理工具，Sass/Less 能做的 CSS Grace 也能做，他们不能的，CSS Grace 也可以。而且不改变 CSS 原生的语法，让 CSS 写起来更简单，更优雅。



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
  fs.writeFileSync('output.css', cssgrace.process(css).css);
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

5. 在命令行中执行 ```node test.js```，快去看看 output.css 中发生了什么吧！


## 功能

### 选择器优化

1. 伪元素两个冒号替换为一个冒号

  当存在：```::before```, ```::after```, ```::first-line```, ```::first-letter``` 选择器时, 替换为一个冒号。

  输入

  ```css
  .foo::after {
    position: absolute;
  }

  .bar::first-line {
    color: #333;
  }
  ```

  输出
  ```css
  .foo:after {
    position: absolute;
  }
  ```


2. ```::before```, ```::after``` 自动增加 content: '';

  当伪元素选择器中有声明但没写 content，自动增加content: ''

  输入

  ```css
  .foo:after {
    position: absolute;
  }
  ```

  输出

  ```css
  .foo:after {
    content: '';
    position: absolute;
  }
  ```

--------------
### mixin

1. rgba 转换为滤镜

  当 background 或 background-color 中颜色为 rgba() 时，自动生成IE filter。

  输入

  ```css
  .foo {
    background: rgba(163, 55, 0, .3);
  }
  ```

  输出
  ```css
  .bar {
    background: rgba(163, 55, 0, .3);
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#4ca33700', endColorstr='#4ca33700');
  }

  :root .bar {
    filter: none\9;
  }
  ```
  由于 IE9 同时支持 rgba 和 filter，会导致两个颜色叠加，这里使用 :root hack 去掉 filter。

2. opacity 转换为滤镜

  输入

  ```css
  .foo {
    opacity: .6;
  }
  ```

  输出

  ```css
  .foo {
    opacity: 0.6;
    filter: alpha(opacity=60);
  }
  ```



  如果是多位小数，filter 中的数值会四舍五入。

  输出

  ```css
  .foo {
    opacity: 0.6253;
    filter: alpha(opacity=63);
  }

3. inline-block

  输入

  ```css
  .foo {
    display: inline-block;
  }
  ```

  输出

  ```css
  .foo {
    display: inline-block;
    *display: inline;
    *zoom: 1;
  }
  ```

4. text-overflow: ellipsis

  ellipsis 只有在不换行以及 overflow: hidden 时才生效。

  输入

  ```css
  .foo {
    text-overflow: ellipsis;
  }
  ```

  输出

  ```css
  .foo {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  ```

5. resize

  resize 只有在 overflow 不为 visible 时生效

  输入

  ```css
  .foo {
    resize: horizontal;
  }
  ```

  输出

  ```css
  .foo {
    resize: horizontal;
    overflow: auto;
  }
  ```

6. clearfix 闭合浮动

  以前我们在需要闭合浮动的元素上增加 class ```.clearfix```, 样式和结构存在耦合。

  ```css
  .clearfix:before,
  .clearfix:after {
    content: "";
    display: table;
  }

  .clearfix:after {
    clear: both;
  }

  .clearfix {
    *zoom: 1;
  }
  ```

  现在只需在CSS中使用 clear: fix 即可。

  输入

  ```css
  .foo {
    clear: fix;
  }
  .foo .bar {
    float: left;
  }
  ```

  输出

  ```css
  .foo {
    *zoom: 1;
  }
  .foo:after {
    clear: both
  }
  .foo:before,
  .foo:after {
    content: "";
    display: table
  }
  .foo .bar {
    float: left;
  }
  ```

--------------

### 让浏览器支持暂未实现的 CSS3 新特性

1. 绝对定位元素居中：position: center

  输入

  ```css
  .foo {
    position: center;
    width: 110px;
    height: 23em;
  }
  ```

  输出

  ```css
  .foo {
    position: absolute;
    width: 110px;
    height: 23em;
    margin-left: -55px;
    margin-top: -11.5em;
    top: 50%;
    left: 50%;
  }
  ``` 

  CSS Grace 会自动计算 margin 中的值，麻麻再也不用担心我算术不好了。

--------------

### 修复常见错误

1. 浮动或绝对定位元素不用写 display: block;

  当存在 float: left|right 或者 position: absolute|fixed 时，会自动删除多余的  display: block。

  输入

  ```css
  .foo {
    position: absolute;
    display: block;
  }

  span {
    float: left;
    display: block;
  }
  ```

  输入

  ```css
  .foo {
    position: absolute;
  }

  span {
    float: left;
  }
  ```

2. -webkit-text-size-adjust: none 改为 100%

  -webkit-text-size-adjust: none 会导致页面字号无法缩放，影响页面的可用性，尤其是在移动设备上。

  输入

  ```css
  body {
    -webkit-text-size-adjust: none;
  }
  ```

  输出

  ```css
  body {
    -webkit-text-size-adjust: 100%;
  }
  ```
</div>
