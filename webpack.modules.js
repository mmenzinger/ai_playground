const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const EsmWebpackPlugin = require('@purtuga/esm-webpack-plugin');
const glob = require('glob');

const alias = require('./webpack.alias.js');

module.exports = {
    entry: {
        'lib/utils': './src/lib/utils',
        'lib/prolog': './src/lib/prolog',
        'lib/tensorflow': './src/lib/tensorflow',
    },

    output: {
        filename: '[name].js',
        library: 'LIB',
        libraryTarget: 'var',
    },

    resolve: {
        alias,
        extensions: ['.ts', '.js', '.mjs'],
    },

    module: {
        rules: [
            {
                test: /\.(ts|js|mjs)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                }
            },
            {
                test: /\.css$/,
                loader: 'lit-css-loader'
            },
        ]
    },

    plugins: [
        new EsmWebpackPlugin(),
    ],
};