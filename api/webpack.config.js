const webpack = require('webpack')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin')

module.exports = {
  entry: ['webpack/hot/poll?100', './src/main.ts'],
  target: 'node',
  optimization: {
    minimize: false,
  },
  node: {
    __dirname: false,
  },
  externals: [
    nodeExternals({
      allowlist: ['webpack/hot/poll?100'],
    }),
  ],
  module: {
    rules: [
      {
        test: /my_client\/.*\.js$/,
        use: 'imports-loader?define=>false',
      },
      {
        test: /.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['css-loader'],
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              mimetype: 'image/png',
            },
          },
        ],
      },
    ],
  },
  mode: 'development',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      '@configs': path.resolve(__dirname, 'src/config'),
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new RunScriptWebpackPlugin({ name: 'server.js', autoRestart: false }),
    new CopyWebpackPlugin({
      patterns: [
        './node_modules/swagger-ui-dist/swagger-ui.css',
        './node_modules/swagger-ui-dist/swagger-ui-bundle.js',
        './node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js',
        './node_modules/swagger-ui-dist/favicon-16x16.png',
        './node_modules/swagger-ui-dist/favicon-32x32.png',
      ],
    }),
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'server.js',
  },
}
