
const
    path = require('path'),
    webpack = require('webpack');
//    terser = require('terser-webpack-plugin');

const config = {
  entry: './src/scripts/build.js',
  output: {
    path: path.resolve(__dirname, 'docs/build/'),
    filename: 'rmr-drops.bundle.js'
  },
//  mode: 'production',
  mode: 'development',
  watch: true,
  plugins : [
//     new terser({
//       extractComments: false,
//       test: /\.js(\?.*)?$/i
//     }),
  ],
  module: {
    rules: [
    ]
  }
};

module.exports = config;
