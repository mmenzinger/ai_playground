const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require("webpack");

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-cheap-module-source-map',

    output: {
        path: path.resolve(__dirname, 'build/dev'),
    },

    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: false,
        }),
    ],

    module: {
        rules: [
        ],
    },

    devServer: {
        contentBase: path.join(__dirname, 'build/dev'),
    },
});