const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = {
  devtool: "eval-cheap-source-map",
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'index.bundle.js',
  },
  devServer: {
    static: {
      watch: true,
    },
    port: 3010,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        }
      },
      {
        test: /\.(css|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|ico)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        },
      },
    ]
  },
  externals: [
    (function () {
      var IGNORES = [
        'electron'
      ];
      return function ({context, request}, callback) {
        if (IGNORES.indexOf(request) >= 0) {
          return callback(null, "require('" + request + "')");
        }
        return callback();
      };
    })(),
  ],
  resolve: {
    // fallback: { crypto: false },
    alias: {
      crypto: "crypto-browserify",
      stream: "stream-browserify",
      https: "https-browserify",
      http: "http-browserify",
      os: "os-browserify"
    },
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }),
  ],
};
