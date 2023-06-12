const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const Dotenv = require('dotenv-webpack')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
// eslint-disable-next-line no-unused-vars
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')


module.exports = (env, options) => {
  const { mode, report } = options
  const isDev = mode !== 'production'
  const isReportEnabled = !!report
  const publicPath = env.public_path ? env.public_path : '/'
  const originalDistFolder = env.dist ? env.dist : 'dist'
  const distFolder = originalDistFolder + publicPath

  const cssModuleLoader = {
    loader: 'css-loader',
    options: {
      modules: {
        localIdentName: isDev
          ? '[name]_[local]_[hash:base64:2]'
          : '[hash:base64:8]',
      },
    },
  }

  const cssLoader = {
    loader: 'css-loader',
    options: {
      modules: {
        compileType: 'icss',
      },
      importLoaders: 1,
    },
  }

  const cssExtractLoader = isDev ? 'vue-style-loader' : MiniCssExtractPlugin.loader
  const sassLoader = {
    loader: 'sass-loader',
    options: {
      implementation: require('node-sass'),
    },
  }
  const sassResourcesLoader = {
    loader: 'sass-resources-loader',
    options: {
      resources: [
        './assets/styles/_variables.scss',
        './assets/styles/_mixins.scss',
        './assets/styles/_functions.scss',
      ],
    },
  }

  const config = {
    entry: path.resolve(__dirname, './src/main.js'),
    output: {
      path: path.resolve(__dirname, `./${distFolder}/`),
      filename: `js/[name]${isDev ? '' : '.[hash:8]'}.js`,
      publicPath,
    },
    resolve: {
      extensions: ['*', '.js', '.vue', '.scss', '.css'],
      modules: ['node_modules', 'js'],
    },
    plugins: [
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].[hash:8].css',
      }),
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
      }),
      new Dotenv(),
    ],
    module: {
      rules: [
        {
          test: /\.(glsl|vert|frag)$/,
          exclude: /node_modules/,
          use: [
            'raw-loader',
            'glslify-loader',
          ],
        },
        {
          test: /\.(jpe?g|png|webp|avif|jp2)$/i,
          oneOf: [
            {
              loader: 'responsive-loader',
              resourceQuery: /responsive/,
              options: {
                // eslint-disable-next-line global-require
                adapter: require('responsive-loader/sharp'),
                sizes: [1100, 1600, 2800, 4200, 10000],
                name: '[path]/[name].[hash:8].[width].[ext]',
                placeholder: false,
                quality: 100,
              },
            },
            {
              loader: 'file-loader',
              options: {
                name: '[path]/[name].[hash:8].[ext]',
              },
            },
          ],
        },
        {
          test: /\.(svg|gif|woff(2)?|ttf|gltf|glb|csv|ply|mp4|webm|eot|otf|basis|mp3)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path]/[name].[hash:8].[ext]',
              },
            },
          ],
        },
        {
          test: /\.scss$/,
          oneOf: [
            {
              resourceQuery: /module/,
              use: [cssExtractLoader, cssModuleLoader, 'postcss-loader', sassLoader, sassResourcesLoader],
            },
            {
              use: [
                cssExtractLoader,
                cssLoader,
                'postcss-loader',
                sassLoader,
                sassResourcesLoader,
              ],
            },
          ],
        },
        {
          test: /\.css$/,
          oneOf: [
            {
              resourceQuery: /module/,
              use: [cssExtractLoader, cssModuleLoader, 'postcss-loader'],
            },
            {
              use: [cssExtractLoader, cssLoader, 'postcss-loader'],
            },
          ],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
        {
          test: /\.vue$/,
          exclude: /node_modules/,
          use: ['vue-loader'],
        },
      ],
    },
    devServer: {
      hot: true,
      inline: true,
      historyApiFallback: true,
      contentBase: './',
      watchContentBase: true,
      disableHostCheck: true,
      progress: true,
    },
    performance: {
      maxEntrypointSize: 1024 * 1024,
      maxAssetSize: 2 * 1024 * 1024,
    },
    optimization: {
      runtimeChunk: true,
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /node_modules/,
            chunks: 'initial',
            name: 'vendor',
            enforce: true,
          },
        },
      },
    },
    stats: 'minimal',
  }

  if (isReportEnabled) {
    config.plugins.push(new BundleAnalyzerPlugin())
  }

  if (isDev) {
    config.devtool = 'eval-source-map'
  }

  if (!isDev) {
    config.plugins.push(new CleanWebpackPlugin())

    config.plugins.push(new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'static'),
          to: path.resolve(__dirname, `${distFolder}/static`),
        },
      ],
    }))

    config.plugins.push(new ImageMinimizerPlugin({
      loader: false,
      filename: '[path]/[name].[ext]',
      minimizerOptions: {
        plugins: [['mozjpeg', { quality: 97, progressive: false }], 'optipng'],
      },
      filter: (_, filePath) => !filePath.includes('static/') && filePath.includes('lossless') && !filePath.includes('sequences'),
    }))

    config.plugins.push(new ImageMinimizerPlugin({
      loader: false,
      filename: '[path]/[name].[ext]',
      minimizerOptions: {
        plugins: [['mozjpeg', { quality: 70, progressive: false }], ['pngquant', { quality: [0.3, 0.4] }]],
      },
      filter: (_, filePath) => !filePath.includes('static/') && !filePath.includes('lossless') && !filePath.includes('sequences'),
    }))
  }

  return config
}
