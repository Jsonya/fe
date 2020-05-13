module.exports = function(source) {
    if (source) {
      console.log('>>>>>copy-loader处理: ', source)
      source = source.split('').concat([' [name] ', ' [pluginName] ']).join('')
    }
    return source;
}