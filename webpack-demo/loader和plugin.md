loader和plugin区别

## webpack究竟处理什么

> 官方解释：*webpack* 是一个现代 JavaScript 应用程序的*静态模块打包器(module bundler)*。当 webpack 处理应用程序时，它会递归地构建一个*依赖关系图(dependency graph)*，其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个 bundle

理解起来就是：

1. 从入口文件开始逐层识别模块依赖
2. 经过分析代码、转换代码、编译代码、输出代码
3. 最后输出打包代码



## 什么是loader

>  官网解析：loader用于对模块的源代码进行转换。类似于其他构建工具中的“任务”，可以将文件从不同的语言转换为js。

loader是文件加载器，能够加载资源文件，并且对这些文件进行一些处理，例如编译、压缩等，最终一起打包到指定的文件中

1. 处理一个文件可以使用多个loader，loader的执行顺序和配置中的顺序是相反的，即最后一个loader最先执行，第一个loader最后执行。
2. 第一个执行的loader接收源文件内容最为参数，其他loader接收前一个执行的loader的返回值作为参数，最后执行的loader会返回此模块的js源码
3. loader本质就是一个函数，接收源文件为参数，返回转换的结果。



## 什么是plugin

>  官网解析: plugin是一个具有apply属性的js对象，目的在于解决loader无法解决的其他事情。

在webpack运行的生命周期中会广播很多事件，plugin可以监听这些事件，在合适的时机通过webpack提供的api改变输出结果。可以理解成在构建流程中注入各种钩子。



## 为什么会出现loader、plugin

webpack只能够理解js、json文件，loader可以让webpack能够去处理其他类型的文件，并转换成有效模块。



## 区别是什么

#### 从运行时机的角度来分析

1. loade运行在打包文件之前，在模块加载时的预处理。
2. plugin在整个编译周期都能够起作用

#### 从作用的角度分析

1. 对于loader而言，他是一个转换器，将A文件进行编译生成B文件，这里操作的是文件，比如将A.scss转换成A.css，是一个单纯的文件转换过程。
2. plugin是一个扩展器，它丰富了webpack本身，针对loader结束后，webpack打包的整个过程，塔并不直接操作文件，而是基于事件机制工作，它会监听webpack打包过程中的某些节点，执行广泛的任务。



## compiler和Compilation

#### Compiler 是什么

Compiler对象包含了 Webpack 环境所有的的配置信息，包含 options，loaders，plugins 这些信息，这个对象在 Webpack 启动时候被实例化，它是全局唯一的，可以简单地把它理解为 Webpack 实例。

#### Compilation是什么

Compilation 对象包含了当前的模块资源、编译生成资源、变化的文件等。当 Webpack 以开发模式运行时，每当检测到一个文件变化，一次新的 Compilation 将被创建。Compilation 对象也提供了很多事件回调供插件做扩展。通过 Compilation 也能读取到 Compiler 对象。

#### 区别是什么

Compiler 代表了整个 Webpack 从启动到关闭的生命周期，而 Compilation 只是代表了一次新的编译。



## 举个🌰

#### 写一个loader

下面的这个loader做的一个处理就是将txt文件源码中的`[name]`替换成webpack配置中注册该loader时options定义的name。

```js
// loader/replace-loader.js
// 该工具是webpack提供出来的
const loaderUtils = require('loader-utils');

module.exports = function(source) {
    console.log('>>>>>replace-loader处理: ', source)
    // 获取到用户给当前 Loader 传入的 options
    const options = loaderUtils.getOptions(this);
    console.log({
        source,
        options,
    });
    // 将源文件中的[name]修改为options中传入的name，返回js export
    source = source.replace(/\[name\]/g, options.name)
    return `export default ${JSON.stringify(source)}`;
}

// webpack.config.js
module.exports = {
  // ...省略一些配置
	module: {
      rules: [
          {
              test: /\.txt$/,
              use: [{
                  loader: 'replace-loader',
                  options: {
                    name: 'replace-loader'
                }
              }]
          }
      ]
  },
  // ResolveLoader 用于配置 Webpack 如何寻找 Loader
  // 默认情况下只会去 node_modules 目录下寻找，为了让 Webpack 加载放在本地项目中的 Loader 需要修改 resolveLoader.modules
  resolveLoader: {
    // 去哪些目录下寻找 Loader，有先后顺序之分
    modules: [path.join(__dirname, '/loader')]
  },
}
```



#### 编写一个plugin

```js
// my-plugin.js
// plugin执行过程，先new一个plugin实例出来，然后会通过
// compiler.plugin监听到webpack广播出来的事件，并且可以
// 通过compiler对象去操作webpack
class MyPlugin {
    constructor(options) {
        console.log('>>>>>MyPlugin Options', options);
    }
    apply(compiler) {
        // 注册插件
        compiler.hooks.run.tap('MyPlugin', compilation => {
            console.log("webpack 构建过程开始！");
        });
        compiler.plugin('emit', (compilation, callback) => {
            // 下面这个console可以打印出compilation对象，该对象实际上是当前模块的资源
            // console.log('>>>>>emit 接收', compilation)
            console.log('>>>>>当前打包后的资源', compilation.assets)
            // 我可以在这里对打包的资源做二次加工
            // 遍历打包后资源
            for (var filePathName in compilation.assets) {
                // 如果是bundle文件
                if (/bundle/i.test(filePathName)) {
                    // 将资源读取出来
                    let content = compilation.assets[filePathName].source() || '';
                    // 将copy-loader里面的pluginName替换成我自己的名字
                    content = content.replace('[pluginName]', '小宝是猪');
                    // 将修改后的资源替换回去，其实就是重写方法
                    compilation.assets[filePathName] = {
                        source () {
                          return content;
                        },
                        size () {
                          return content.length;
                        }
                    }
                }
            }
            // 执行回调
            callback();
        });
    }
}
module.exports = MyPlugin;
```

这个插件的作用就是将[pluginName]替换成想要的内容。

