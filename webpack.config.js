const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const OptimizeThreePlugin = require('@vxna/optimize-three-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
    entry: [ './src/js/main.js' ],
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'js/[name].[contenthash].js',
        clean: true,
        publicPath: '/'
    },
    resolve: {
        alias: {
            'three': path.resolve(__dirname, 'node_modules/three'),
            'three/addons': path.resolve(__dirname, 'node_modules/three/examples/jsm')
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.(glsl|frag|vert)$/,
                type: 'asset/source',
                exclude: /node_modules/
            },
            {
                test: /\.(glsl|frag|vert)$/,
                loader: 'glslify-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                  devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                  {
                    loader: 'css-loader',
                    options: {
                        sourceMap: true
                    }
                  },
                  {
                    loader: 'sass-loader',
                    options: {
                        sourceMap: true,
                        sassOptions: {
                            includePaths: [path.resolve(__dirname, 'public/fonts')]
                        }
                    }
                  }
                ],
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg|ico|webmanifest)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name][ext]'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            favicon: 'public/favicon/favicon.ico'
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.ids.HashedModuleIdsPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'public/favicon',
                    to: 'favicon'
                },
                {
                    from: 'public/site.webmanifest',
                    to: 'site.webmanifest'
                },
                {
                    from: 'public/fonts',
                    to: 'fonts'
                },
                { from: 'public/fonts', to: 'fonts' },
                { from: 'public', to: '' }
            ]
        }),
        new BrowserSyncPlugin(
            {
                host: 'localhost',
                port: 3001,
                proxy: 'http://localhost:8080/',
                open: false,
                files: [
                    {
                        match: ['**/*.html'],
                        fn: event => {
                            if (event === 'change') {
                                const bs = require('browser-sync').get(
                                    'bs-webpack-plugin'
                                )
                                bs.reload()
                            }
                        }
                    }
                ],
                middleware: [
                    function(req, res, next) {
                        if (req.url.endsWith('.css')) {
                            res.setHeader('Content-Type', 'text/css');
                        } else if (req.url.endsWith('.js')) {
                            res.setHeader('Content-Type', 'application/javascript');
                        }
                        next();
                    }
                ]
            },
            {
                reload: false
            }
        ),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash].css',
        }),
        new OptimizeThreePlugin()
    ],
    devServer: {
        hot: true,
        static: {
            directory: path.resolve(__dirname, 'public'),
            publicPath: '/',
            serveIndex: true,
            watch: true
        },
        devMiddleware: {
            publicPath: '/',
            writeToDisk: true
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
        }
    },
    devtool: devMode ? 'eval-source-map' : false,
    optimization: {
        minimizer: [
            new TerserPlugin(),
            new CssMinimizerPlugin()
        ],
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                      const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                      return `npm.${packageName.replace('@', '')}`;
                    },
                }
            }
        }
    }
}
