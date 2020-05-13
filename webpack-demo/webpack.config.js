const path = require('path');
const MyPlugin = require('./plugin/my-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
      rules: [
          {
              test: /\.txt$/,
              use: [{
                  loader: 'replace-loader',
                  options: {
                    name: 'replace-loader'
                }
              }, {
                loader: 'copy-loader'
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
  plugins: [
      new MyPlugin({
          params: 'fortest'
      })
  ]
};