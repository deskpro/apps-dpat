const execSync = require('child_process').execSync;
const nodeRoot = execSync('npm root -g').toString().trim();

const path = require('path');
const dpatNodeModulesPath = path.join(nodeRoot, '@deskproapps', 'dpat', 'node_modules');

const webpack = require('@deskproapps/dpat/node_modules/webpack');
const ManifestPlugin = require('@deskproapps/dpat/node_modules/chunk-manifest-webpack-plugin');
const ChunkManifestPlugin = require('@deskproapps/dpat/node_modules/webpack-chunk-hash');
const WebpackChunkHash = require('@deskproapps/dpat/node_modules/webpack-chunk-hash');
const ExtractTextPlugin = require('@deskproapps/dpat/node_modules/extract-text-webpack-plugin');

const BuildUtils = require('@deskproapps/dpat/src/main/javascript/webpack/BuildUtils');
const CopyAssets = require('@deskproapps/dpat/src/main/javascript/webpack/CopyAssets');

module.exports = function (env) {

  const PROJECT_ROOT_PATH = env && env.DP_PROJECT_ROOT ? env.DP_PROJECT_ROOT : path.resolve(__dirname, '../../');
  const ASSET_PATH = 'assets';
  const PRODUCTION = !env || !env.NODE_ENV || env.NODE_ENV === 'production';

  const extractCssPlugin = new ExtractTextPlugin({ filename: '[name].css', publicPath: `/${ASSET_PATH}/`, allChunks: true });

  const configParts = [{}];
  configParts.push({
    devtool: PRODUCTION ? false : 'source-map',
    entry: {
        main: [ path.resolve(PROJECT_ROOT_PATH, 'src/webpack/entrypoint.js') ],
        vendor: BuildUtils.autoVendorPackages(PROJECT_ROOT_PATH)
    },
    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM',
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
      chunkFilename: '[name].js',
      filename: '[name].js',
      path: path.resolve(PROJECT_ROOT_PATH, 'dist', ASSET_PATH)
    },
    plugins: [
      extractCssPlugin,

      new webpack.DefinePlugin({ PRODUCTION: PRODUCTION }),

      // for stable builds, in production we replace the default module index with the module's content hashe
      new webpack.HashedModuleIdsPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: !PRODUCTION,
        compress: {unused: true, dead_code: true, warnings: false}
      }),

      // replace a standard webpack chunk hashing with custom (md5) one
      new WebpackChunkHash(),
      // vendor libs + extracted manifest
      new webpack.optimize.CommonsChunkPlugin({ name: ['vendor', 'manifest'], minChunks: Infinity }),
      // export map of chunks that will be loaded by the extracted manifest
      new ChunkManifestPlugin({ filename: 'manifest.json', manifestVariable: 'webpackManifest' }),
      // mapping of all source file names to their corresponding output file
      new ManifestPlugin({ fileName: 'asset-manifest.json' }),

      CopyAssets.copyWebpackPlugin(PROJECT_ROOT_PATH)(`target/${BASE_PATH}`),
    ],
    resolve: {
      extensions: ['*', '.js', '.jsx', '.scss', '.css']
    },
    resolveLoader: {
      modules: [ "node_modules", dpatNodeModulesPath ],
    },
    node: { fs: 'empty' },
    bail: true
  });

  return Object.assign.apply(Object, configParts)
};
