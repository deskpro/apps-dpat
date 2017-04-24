const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');
const WebpackChunkHash = require('webpack-chunk-hash');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function (env) {

  const PROJECT_ROOT_PATH = env.DP_PROJECT_ROOT || path.resolve(__dirname, '../../');
  const ASSET_PATH = 'assets';
  const PRODUCTION = !env.NODE_ENV || env.NODE_ENV === 'production';

  const artifactName = require('./BuildUtils').artifactName(PROJECT_ROOT_PATH);
  const copyWebpackPlugin = require('./CopyAssets').copyWebpackPlugin(PROJECT_ROOT_PATH)('dist');
  const extractCssPlugin = new ExtractTextPlugin({ filename: '[name].css', publicPath: `/${ASSET_PATH}/`, allChunks: true });

  const configParts = [{}];
  configParts.push({
    devtool: 'source-map',
    entry: {
        main: [ path.resolve(PROJECT_ROOT_PATH, 'src/webpack/entrypoint.js') ],
        vendor: ['semantic-ui-react', 'superagent', 'superagent-promise', 'error-wrapper']
    },
    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM',
      'deskproapps-sdk-react': 'DeskproAppsSDKReact'
    },
    module: {
      loaders: [
        {
            test: /\.jsx?$/,
            loader: 'babel-loader',
            include: [
                path.resolve(PROJECT_ROOT_PATH, 'src/main/javascript'),
            ]
        },
        {
            test: /\.css$/,
            use: extractCssPlugin.extract({ use: ['style-loader', 'css-loader'] })
        },
        {
            include: [ path.resolve(PROJECT_ROOT_PATH, 'src/main/sass') ],
            loader: extractCssPlugin.extract({ use: ['css-loader', 'sass-loader'] }),
            test: /\.scss$/
        }
      ],
    },
    output: {
      pathinfo: !PRODUCTION,
      chunkFilename: artifactName('[name].js'),
      filename: artifactName('[name].js'),
      path: path.resolve(PROJECT_ROOT_PATH, 'dist', ASSET_PATH)

      //publicPath: `/${ASSET_PATH}/`
    },
    plugins: [
      extractCssPlugin,

      new webpack.DefinePlugin({ PRODUCTION: PRODUCTION }),
      // for stable builds, in production we replace the default module index with the module's content hashe
      new webpack.HashedModuleIdsPlugin(),

      // replace a standard webpack chunk hashing with custom (md5) one
      new WebpackChunkHash(),
      // vendor libs + extracted manifest
      new webpack.optimize.CommonsChunkPlugin({ name: ['vendor', 'manifest'], minChunks: Infinity }),
      // export map of chunks that will be loaded by the extracted manifest
      new ChunkManifestPlugin({ filename: artifactName('manifest.json'), manifestVariable: 'webpackManifest' }),
      // mapping of all source file names to their corresponding output file
      new ManifestPlugin({ fileName: artifactName('asset-manifest.json') }),

      copyWebpackPlugin
    ],
    resolve: {
      extensions: ['*', '.js', '.jsx', '.scss', '.css']
    },
    node: { fs: 'empty' },
    bail: true
  });

  return Object.assign.apply(Object, configParts)
};
