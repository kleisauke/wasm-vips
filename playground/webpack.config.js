const path = require('node:path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    playground: './src/index.js',
    samples: './src/samples.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          },
          'css-loader'
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext][query]'
        }
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false
          }
        },
        extractComments: false,
        exclude: /samples[\\/]/
      })
    ],
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'monaco-editor'
        }
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    new HtmlWebpackPlugin({
      title: 'wasm-vips playground',
      template: './src/index.html',
      hash: true
    }),
    new HtmlWebpackPlugin({
      filename: 'playground-runner.html',
      template: './src/playground-runner.html',
      excludeChunks: ['playground', 'samples'],
      minify: false
    }),
    new MonacoWebpackPlugin({
      filename: 'js/monaco-[name].worker.js',
      languages: ['typescript', 'javascript', 'html', 'css']
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'images'),
          to: path.resolve(__dirname, 'dist', 'images')
        },
        {
          from: path.resolve(__dirname, 'samples'),
          to: path.resolve(__dirname, 'dist', 'samples')
        },
        {
          from: path.resolve(__dirname, '..', 'lib', 'vips.d.ts'),
          to: path.resolve(__dirname, 'dist', 'lib')
        },
        {
          from: path.resolve(__dirname, '..', 'lib', '*.js'),
          globOptions: {
            ignore: ['**/*-node*.js']
          },
          to: path.resolve(__dirname, 'dist', 'lib')
        },
        {
          from: path.resolve(__dirname, '..', 'lib', '*.wasm'),
          to: path.resolve(__dirname, 'dist', 'lib')
        }
      ]
    })
  ],
  devServer: {
    open: ['/playground'],
    client: {
      overlay: false
    },
    devMiddleware: {
      writeToDisk: true
    },
    static: {
      directory: path.resolve(__dirname, 'dist'),
      publicPath: '/playground'
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    }
  }
};
