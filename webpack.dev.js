const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-cheap-module-source-map',

    entry: {
        //'service-worker': './src/worker/service.worker.dev.js',
    },

    output: {
        path: path.resolve(__dirname, 'build/dev'),
    },

    plugins: [
        /*new HtmlWebPackPlugin({
            template: "./index.html",
            filename: "./index.html",
        }),*/
    ],

    module: {
        rules: [
        ],
    },

    devServer: {
        contentBase: path.join(__dirname, 'build/dev'),
    },
});