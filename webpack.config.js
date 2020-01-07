
const
    path = require('path'),
    webpack = require('webpack');

const config = {
  entry: './src/scripts/build.js',
  output: {
    path: path.resolve(__dirname, 'docs/build/'),
    filename: 'rmr-drops.bundle.js'
  },
  mode: 'production',
//  mode: 'development',
  watch: true,
  plugins : [
//     new webpack.optimize.UglifyJsPlugin({
//       compress: { warnings: false }
//     })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
//        include: path.resolve(__dirname, 'src'),
        use: [{
          loader: 'babel-loader',
          options: {
            presets: [
              ['es2015']
            ]
          }
        }]
      }
    ]
  }
};

module.exports = config;
