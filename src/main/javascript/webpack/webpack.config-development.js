const path = require('path');
const webpack = require('webpack');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = function (env) {

  const PROJECT_ROOT_PATH = env && env.DP_PROJECT_ROOT ? env.DP_PROJECT_ROOT : path.resolve(__dirname, '../../');
  const ASSET_PATH = 'assets';

  const artifactName = require('./BuildUtils').artifactName(PROJECT_ROOT_PATH);
  const copyWebpackPlugin = require('./CopyAssets').copyWebpackPlugin(PROJECT_ROOT_PATH)('target');
  const extractCssPlugin = new ExtractTextPlugin({
    filename: '[name].css',
    publicPath: `/${ASSET_PATH}/`,
    allChunks: true
  });

  const configParts = [{}];
  configParts.push({
    devServer: {
      contentBase: path.resolve(PROJECT_ROOT_PATH, 'target'),
      clientLogLevel: 'warning',
      hot: true,
      historyApiFallback: true,
      port: 31080,
      publicPath: ['/', ASSET_PATH, '/'].join(''),
      watchContentBase: true
    },
    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM',
      'deskproapps-sdk-react': 'DeskproAppsSDKReact'
    },
    devtool: 'inline-source-map',
    entry: {
      main: [
        `webpack-dev-server/client?http://localhost:31080`,
        path.resolve(PROJECT_ROOT_PATH, 'src/webpack/entrypoint.js')
      ],
      vendor: ['react', 'react-dom', 'semantic-ui-react', 'deskproapps-sdk-react']
    },
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          include: [path.resolve(PROJECT_ROOT_PATH, 'src/main/javascript'),]
        },
        {
          test: /\.css$/,
          use: extractCssPlugin.extract({use: ['style-loader', 'css-loader']})
        },
        {
          include: [path.resolve(PROJECT_ROOT_PATH, 'src/main/sass')],
          loader: extractCssPlugin.extract({use: ['css-loader', 'sass-loader']}),
          test: /\.scss$/
        }
      ],
    },
    output: {
      chunkFilename: `${ASSET_PATH}/${artifactName('[name].js')}`,
      filename: artifactName('[name].js'),
      path: path.resolve(PROJECT_ROOT_PATH, 'target'),
      publicPath: ['/', ASSET_PATH, '/'].join('')
    },
    plugins: [
      extractCssPlugin,

      new webpack.optimize.CommonsChunkPlugin({name: ['vendor'], minChunks: Infinity}),
      new webpack.NamedModulesPlugin(),
      copyWebpackPlugin,
      new WriteFilePlugin({
        test: /\html\/|assets\/|dists\/|manifest\.json/,
        useHashIndex: false
      }),

      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
    ],
    resolve: {
      extensions: ['*', '.js', '.jsx', '.scss', '.css']
    },
    node: {fs: 'empty'},
    bail: true
  });

  return Object.assign.apply(Object, configParts);
};
