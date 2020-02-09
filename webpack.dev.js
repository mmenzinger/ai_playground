const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-cheap-module-source-map',

    output: {
        path: path.resolve(__dirname, 'build/dev'),
    },

    plugins: [
    ],

    module: {
        rules: [
        ],
    },

    devServer: {
        contentBase: path.join(__dirname, 'build/dev'),
    },
});