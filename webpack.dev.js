const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const app = require('./webpack.app.js');
const modules = require('./webpack.modules.js');

const config = {
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

    devServer: {
        contentBase: path.join(__dirname, 'build/dev'),
    },
}

module.exports = [
    merge(app, config),
    merge(modules, config),
];