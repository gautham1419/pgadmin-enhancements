/* eslint-disable */

const path = require('path');
const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin'); // Add this line

module.exports = {
  mode: 'development',
  entry: './src/js/pgadmin.js', // Entry point for the application
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'assets'), // Serve static files from 'assets'
    },
    hot: true, // Enable hot-reloading
    port: 5050, // Port for the development server
    devMiddleware: {
      publicPath: '/', // Serve the bundle.js file from the root
    },
    historyApiFallback: true, // Enable HTML5 history API fallback
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/, // Match both .js and .jsx files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'], // Enable React support
            plugins: ['react-refresh/babel'], // Enable React Fast Refresh
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Resolve .js and .jsx files
    fallback: {
      // Polyfills for Node.js core modules
      assert: require.resolve('assert'),
      crypto: require.resolve('crypto-browserify'),
      fs: false, // 'fs' is not polyfilled by default
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
      stream: require.resolve('stream-browserify'),
      url: require.resolve('url'),
      util: require.resolve('util'),
      net: false, // 'net' is not polyfilled by default
      child_process: false, // 'child_process' is not polyfilled by default
    },
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(), // Enable HMR
    new ReactRefreshWebpackPlugin(), // Enable React Fast Refresh
    new NodePolyfillPlugin(), // Add this line to polyfill Node.js core modules
  ],
};