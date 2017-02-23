var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var loaders = $LOADERS$;

module.exports = {
  devtool: 'eval-source-map',
  entry: path.resolve('src', '$ENTRY_FILENAME$'),
  output: {
    path: path.resolve('build'),
    filename: '$ENTRY_FILENAME$',
    publicPath: '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve('src', 'index.tpl.html'),
      filename: 'index.html'
    })
  ],
  module: {
    loaders: loaders
  }
};
