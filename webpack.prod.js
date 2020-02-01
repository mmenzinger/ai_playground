const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = merge(common, {
    mode: 'production',

    entry: {
        'service-worker': './src/worker/service.worker.js',
    },

    output: {
        path: path.resolve(__dirname, 'build/prod'),
    },

    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },

    plugins: [
        /*new CleanWebpackPlugin(),
        new HtmlWebPackPlugin({
            template: "./index.html",
            filename: "./index.html",
            minify: {
                collapseWhitespace: true,
                minifyCSS: true,
                minifyJS: true,
                removeComments: true,
            }
        }),*/
    ],

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'minify-lit-html-loader',
                    options: {
                        htmlMinifier: {
                            ignoreCustomFragments: [
                                /\@click=\${.*?(\s*})+/,
                                /\?hidden=\${.*?(\s*})+/,
                                /\?active=\${.*?(\s*})+/,
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