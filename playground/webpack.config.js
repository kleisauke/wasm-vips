const path = require('path');
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
    filename: 'assets/js/[name].js',
    chunkFilename: 'assets/js/[name].js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../../'
            }
          },
          'css-loader'
        ]
      },
      {
        test: /\.(jpe?g|png|gif|tiff?|webp|jxl|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext][query]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext][query]'
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
      filename: 'assets/css/[name].css'
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
      filename: 'assets/js/monaco-[name].worker.js',
      languages: ['typescript', 'javascript', 'html', 'css']
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'samples'),
          to: path.resolve(__dirname, 'dist', 'samples')
        },
        {
          from: path.resolve(__dirname, '..', 'lib', '*.js'),
          to: path.resolve(__dirname, 'dist', 'lib')
        },
        {
          from: path.resolve(__dirname, '..', 'lib', 'vips.d.ts'),
          to: path.resolve(__dirname, 'dist', 'lib')
        },
        {
          from: path.resolve(__dirname, '..', 'lib', 'vips.wasm'),
          to: path.resolve(__dirname, 'dist', 'lib')
        }
      ]
    })
  ],
  devServer: {
    client: {
      overlay: false
    },
    devMiddleware: {
      writeToDisk: true
    },
    static: {
      directory: path.resolve(__dirname, 'dist')
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    }
  }
};
