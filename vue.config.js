const { defineConfig } = require('@vue/cli-service')
// 引入node的核心内置‘path’
// const path = require('path')
module.exports = defineConfig({
  transpileDependencies: true,
  css: {
    loaderOptions: {
      less: {
        // 若 less-loader 版本小于 6.0，请移除 lessOptions 这一级，直接配置选项。
        lessOptions: {
          modifyVars: {
            // 直接覆盖变量
            'nav-bar-background-color': '#007bff',
            'nav-bar-title-text-color': 'white'
            // 或者可以通过 less 文件覆盖（文件路径为绝对路径）
            // __dirname 他是node环境下全局内置环境
            // 用path.join()将__dirname 和 '/src/styles/cover.less' 拼接在一起
            // hack: `true; @import " ${path.join(__dirname, '/src/styles/cover.less')}";`
          }
        }
      }
    }
  },
  publicPath: './' // 告诉webpack打包的index.html引入其他资源文件以./开头，不要默认/开头
})
