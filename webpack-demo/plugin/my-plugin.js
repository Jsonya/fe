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