var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'public');

var config = {
  entry: [
    path.resolve(__dirname, './src/index.jsx')
  ],
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js'
  },
  target: 'web',
  devtool: 'source-map',
  resolve: {
      extensions: ['*', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
    ]
  }
};

module.exports = config;
