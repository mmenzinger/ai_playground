const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = merge(common, {
    mode: 'development',
    //devtool: 'inline-source-map',
    devtool: 'cheap-module-eval-source-map',

    entry: {
        'service-worker': './src/worker/service.worker.dev.js',
    },

    plugins: [
        new HtmlWebPackPlugin({
            template: "./index.html",
            filename: "./index.html",
        }),
    ],

    module: {
        rules: [
        ],
    },
});