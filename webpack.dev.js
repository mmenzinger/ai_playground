const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-cheap-module-source-map',

    entry: {
        'service-worker': './src/service-worker',
    },

    output: {
        path: path.resolve(__dirname, 'build/dev'),
    },

    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: false,
        }),
    ],

    devServer: {
        contentBase: path.join(__dirname, 'build/dev'),
    },
});
