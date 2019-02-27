const config = require('./webpack.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let plugins = [new HtmlWebpackPlugin({
  template: './samples/web/index.html'
})];

module.exports = Object.assign(config, {
  entry: `${__dirname}/samples/web/index.js`,
  plugins,
  node: {
    fs: 'empty'
  },
  devServer: {
    hot: true,
    inline: true,
    clientLogLevel: 'error',
    stats: {
      colors: true
    },
    proxy: {
      '/static': {
        target: 'http://localhost:4500',
        pathRewrite: {
          '^/static': './app/models'
        }
      }
    },
    host: '0.0.0.0',
    port: 4500
  }
});
