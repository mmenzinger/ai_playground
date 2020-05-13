const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.app.js');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


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
    ],

    performance: {
        maxAssetSize: 1024000,
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