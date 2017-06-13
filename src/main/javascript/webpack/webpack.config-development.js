const path = require('path');
const fs = require('fs');

let dpatRoot = require.resolve('@deskproapps/dpat');
while (dpatRoot !== '/' && path.basename(dpatRoot) !== 'dpat') {
  dpatRoot = path.dirname(dpatRoot);
}

const webpack = require('@deskproapps/dpat/node_modules/webpack');
const ExtractTextPlugin = require('@deskproapps/dpat/node_modules/extract-text-webpack-plugin');
const WriteFilePlugin = require('@deskproapps/dpat/node_modules/write-file-webpack-plugin');

const BuildUtils = require('@deskproapps/dpat/src/main/javascript/webpack/BuildUtils');
const CopyAssets = require('@deskproapps/dpat/src/main/javascript/webpack/CopyAssets');

module.exports = function (env) {

  const PROJECT_ROOT_PATH = env && env.DP_PROJECT_ROOT ? env.DP_PROJECT_ROOT : path.resolve(__dirname, '../../');
  const ASSET_PATH = 'assets';

  const manifestJsonPath = path.join(PROJECT_ROOT_PATH, 'manifest.json');
  const manifestJson = require(manifestJsonPath);
  const BASE_PATH = `v${manifestJson.appVersion}/files`;

  const babelOptions = BuildUtils.resolveBabelOptions(PROJECT_ROOT_PATH, { babelrc: false });

  const extractCssPlugin = new ExtractTextPlugin({
    filename: '[name].css',
    publicPath: `/${BASE_PATH}/${ASSET_PATH}/`,
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
      publicPath: `/${BASE_PATH}/${ASSET_PATH}/`,
      watchContentBase: true,
      headers : {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, CONNECT, OPTIONS, TRACE',
        'Access-Control-Allow-Headers': 'Origin, X-Agent-Request'
      }
    },
    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM',
    },
    devtool: 'inline-source-map',
    entry: {
      main: [
        `webpack-dev-server/client?http://localhost:31080`,
        path.resolve(PROJECT_ROOT_PATH, 'src/webpack/entrypoint.js')
      ],
      vendor: BuildUtils.autoVendorDependencies(PROJECT_ROOT_PATH)
    },
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          include: [
            path.resolve(PROJECT_ROOT_PATH, 'src/main/javascript'),
            path.resolve(PROJECT_ROOT_PATH, 'node_modules', '@deskproapps', 'deskproapps-sdk-core'),
            path.resolve(PROJECT_ROOT_PATH, 'node_modules', '@deskproapps', 'deskproapps-sdk-react')
          ],
          options: babelOptions
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
      chunkFilename: `${BASE_PATH}/${ASSET_PATH}/[name].js`,
      filename: '[name].js',
      path: path.resolve(PROJECT_ROOT_PATH, 'target'),
      publicPath: `/${BASE_PATH}/${ASSET_PATH}/`
    },
    plugins: [
      extractCssPlugin,

      new webpack.optimize.CommonsChunkPlugin({name: ['vendor'], minChunks: Infinity}),
      new webpack.NamedModulesPlugin(),

      CopyAssets.copyWebpackPlugin(PROJECT_ROOT_PATH)(`target/${BASE_PATH}`),

      new WriteFilePlugin({
        test: /\html\/|assets\/|dists\/|manifest\.json/,
        useHashIndex: false
      }),

      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
    ],
    resolve: {
      extensions: ['*', '.js', '.jsx', '.scss', '.css'],
      modules: [ "node_modules", path.join(dpatRoot, "node_modules"), path.join(PROJECT_ROOT_PATH, "node_modules") ],
    },
    resolveLoader: {
      modules: [ "node_modules", path.join(dpatRoot, "node_modules"), path.join(PROJECT_ROOT_PATH, "node_modules") ]
    },
    node: {fs: 'empty'},
    bail: true
  });

  return Object.assign.apply(Object, configParts);
};
