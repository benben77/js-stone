# js-stone

> 《两周自制脚本语言》stone 语言的 Typescript 版本。

## 运行项目

运行项目：

```
npm install # 安装依赖
npm run build # ts 转 js
npm run exec # 执行 js (node) 代码
```

调试：

```
npm i -g node-inspect // 安装 node-inspect
npm run inspect // 将 "Debugger listening on" 的地址去掉 ws 用 chrome 打开，打开开发者工具，点 nodejs 标志(绿色的六边形)
// 也可以使用vscode等工具的调试功能
```

## 章节

- chap3: 实现 Lexer (词法解析)
- chap4: 添加 ASTree 及部分子类
- chap5: 添加更多 ASTree 子类(表达式/语法块)，实现语法分析
- chap6: basic interpreter
- chap7-1: 函数
- chap7-2: 闭包
- chap8: 原生方法
- chap9: 类
- chap10: 数组
- chap11: 用数组优化变量存取
- chap12-1: 类属性和方法优化

## 参考

- 《两周自制脚本语言》千叶滋
- [wmathor/Stone-language](https://github.com/wmathor/Stone-language)
