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