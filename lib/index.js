var postcss = require("postcss");

var reVALUE = /([\.0-9]+)(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|dpi|dpcm|dppx|fr)/i;
var reRGBA = /rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([\d\.]+\s*)/i;
var reALL_PE = /::(before|after|first-line|first-letter)/;
var reBEFORE_AFTER = /::|:(before|after)/;

var textReSize = function(decl) {
  if (decl.prop == '-webkit-text-size-adjust' && decl.value == 'none') {
    decl.value = '100%';
  }
}

var cssgraceRule = function(rule, i) {

  /**
   * 选择器优化
   */

  //删除伪元素多余冒号 
  if (rule.selector.match(reALL_PE)) {
    rule.selector = rule.selector.replace('::', ':');
  }

  // before/after 内自动增加 content: '';
  if (rule.selector.match(reBEFORE_AFTER)) {
    // 如果忘记写 content 属性
    var good = rule.some(function(i) {
      return i.prop == 'content';
    });

    if (!good) {
      // 添加 content: "" 
      rule.prepend({
        prop: 'content',
        value: "''"
      });
    }
  }

  // position: center mixin
  var has1 = rule.some(function(i) {
    return i.prop == 'width';
  });
  var has2 = rule.some(function(i) {
    return i.prop == 'height';
  });
  var has3 = rule.some(function(i) {
    return i.prop == 'position' && i.value == 'center';
  });

  if (has1 && has2 && has3) {
    var widthValue, heightValue;

    rule.eachDecl(function(decl, i) {

      if (decl.prop == 'width') {
        matchWidth = decl.value.match(reVALUE);
        widthValue = (-Number(matchWidth[1]) / 2) + matchWidth[2];
      }

      if (decl.prop == 'height') {
        matchHeight = decl.value.match(reVALUE);
        heightValue = (-Number(matchHeight[1]) / 2) + matchHeight[2];
      }

      if (decl.prop == 'position')
        decl.value = 'absolute';
    });

    rule.append({
      prop: 'margin-left',
      value: widthValue
    }).append({
      prop: 'margin-top',
      value: heightValue
    }).append({
      prop: 'top',
      value: '50%'
    }).append({
      prop: 'left',
      value: '50%'
    });

  }



  //遍历decl
  rule.eachDecl(function(decl, i) {
    textReSize(decl);
    /**
     * 删除多余的 display: block
     * 当存在 float: left|right & position: absolute|fixed 时无需写 display: block;
     */

    if (
      (decl.prop == 'float' && decl.value != 'none') ||
      (decl.prop == 'position' && decl.value == 'absolute') ||
      (decl.prop == 'position' && decl.value == 'fixed')
    ) {
      // 查找是否存在 display: block
      decl.parent.each(function(neighbor) {
        if (neighbor.prop == 'display' && neighbor.value == 'block') {
          // 如果存在删掉它
          neighbor.removeSelf();
        }
      });
    }

    /**
     * -webkit-text-size-adjust: none 改为 100%;
     * none 会使页面字号无法缩放
     */




    /**
     * rgba mixin
     * background rgba 转换为 IE ARGB
     *
     .bar {
       background: rgba(163, 55, 0, .3);
       filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#4ca33700', endColorstr='#4ca33700');
     }

     :root .bar {
       filter: none\9;
     }
     *
     */

    //十六进制不足两位自动补 0
    function pad(str) {
      return str.length == 1 ? '0' + str : '' + str;
    }
    if (
      (decl.prop == 'background' || decl.prop == 'background-color') &&
      decl.value.match(reRGBA)
    ) {
      // rgba 转换为 AARRGGBB
      var colorR = pad(parseInt(RegExp.$1).toString(16));
      var colorG = pad(parseInt(RegExp.$2).toString(16));
      var colorB = pad(parseInt(RegExp.$3).toString(16));
      var colorA = pad(parseInt(RegExp.$4 * 255).toString(16));

      var ARGB = "'" + "#" + colorA + colorR + colorG + colorB + "'";

      // 插入IE半透明滤镜
      decl.parent.insertAfter(decl, {
        prop: 'filter',
        value: 'progid:DXImageTransform.Microsoft.gradient(startColorstr=' + ARGB + ', endColorstr=' + ARGB + ')'
      });

      // IE9 rgba 和滤镜都支持，插入 :root hack 去掉滤镜
      var newSelector = '\n:root ' + rule.selector;
      var ieHack = '\\9;' + rule.after;

      var nextrule = postcss.rule({
        selector: newSelector,
        after: ieHack
      });
      decl.parent.parent.insertAfter(rule, nextrule);
      nextrule.append({
        prop: 'filter',
        value: 'none'
      });
    }

    /**
     * opacity mixin
     *
     opacity: 0.6;
     filter: alpha(opacity=60);
     *
     */
    //四舍五入
    var amount = Math.round(decl.value * 100);
    if (decl.prop == 'opacity') {
      rule.insertAfter(decl, {
        prop: 'filter',
        value: 'alpha(opacity=' + amount + ')'
      });
    }

    /**
     * inline-block mixin
     *
     display: inline-block;
     *display: inline;
     *zoom: 1;
     *
     */
    if (decl.prop == 'display' && decl.value == 'inline-block') {
      var before = decl.before;
      decl.parent.insertAfter(i, {
        prop: 'zoom',
        value: '1',
        before: before + '*'
      }).insertAfter(i, {
        prop: 'display',
        value: 'inline',
        before: before + '*'
      });
    }

    /**
     * ellipsis mixin
     * 文字溢出显示省略号
     * 
     text-overflow: ellipsis;
     white-space: nowrap;
     overflow: hidden;
     *
     */
    if (decl.prop == 'text-overflow' && decl.value == 'ellipsis') {
      decl.parent.insertAfter(i, {
        prop: 'overflow',
        value: 'hidden'
      }).insertAfter(i, {
        prop: 'white-space',
        value: 'nowrap'
      });
    }

    /**
     * resize mixin
     * resize 只有在 overflow 不为 visible 时生效
     * 
     resize: horizontal;
     overflow: auto;
     *
     */
    if (decl.prop == 'resize' && decl.value !== 'none') {
      var count = 0;
      decl.parent.eachDecl(function(decl) {
        if (decl.prop == "overflow")
          count++;
      });
      if (count == 0)
        decl.parent.insertAfter(decl, {
          prop: 'overflow',
          value: 'auto'
        });
    }

    /**
     * clearfix mixin
     * 新增 clear: fix 属性
     * 
     .bar {
       *zoom: 1;
     }

     .bar:after {
       clear: both
     }

     .bar:before,
     .bar:after {
       display: table;
       content: ""
     }
     *
     */
    if (decl.prop == 'clear' && decl.value == 'fix') {
      decl.prop = '*zoom';
      decl.value = '1';

      var bothSelector = '\n' + rule.selector + ':before' + ',\n' + rule.selector + ':after';
      var afterSelector = '\n' + rule.selector + ':after';

      var bothRule = postcss.rule({
        selector: bothSelector
      });

      var afterRule = postcss.rule({
        selector: afterSelector
      });

      rule.parent.insertAfter(rule, bothRule);
      rule.parent.insertAfter(rule, afterRule);

      bothRule.append({
        prop: 'content',
        value: '""'
      }).append({
        prop: 'display',
        value: 'table'
      });

      afterRule.append({
        prop: 'clear',
        value: 'both'
      });
    }

  });

};


// PostCSS Processor
var cssgrace = postcss(function(css) {
  css.eachRule(cssgraceRule);
});


module.exports = cssgrace;
