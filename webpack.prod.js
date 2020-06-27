const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',

    output: {
        path: path.resolve(__dirname, 'build/prod'),
    },

    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },

    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: true,
        }),
        new InjectManifest({
            swSrc: './src/worker/service-worker.ts',
            maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // monaco has huge file sizes...
        }),
    ],

    performance: {
        maxAssetSize: 1024*1024,
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|examples|templates)/,
                use: {
                    loader: 'minify-lit-html-loader',
                    options: {
                        htmlMinifier: {
                            ignoreCustomFragments: [
                                /[@?]\w+=\${.*?(\s*})+/,
                            ]
                        }
                    }
                }
            },
        ],
    },

    devServer: {
        contentBase: path.join(__dirname, 'build/prod'),
    },
});