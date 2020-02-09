const path = require('path');
const webpack = require("webpack");
const CopyPlugin = require('copy-webpack-plugin');

const staticFiles = [
    'srcdoc.html',
    'index.html',
    { from: 'assets', to: 'assets' },
    {
        from: './src/scenarios/*/assets/*',
        to: 'scenarios/[1]/assets/[name].[ext]',
        test: /([^/]+)\/assets\/[^/]+$/,
    },
];

const alias = require('./webpack.alias.js');

module.exports = {
    entry: {
        'app': './src/components/ai-app.js',
    },

    output: {
        filename: '[name].js',
    },

    resolve: {
        alias,
    },

    module: {
        rules: [
            {
                test: /\/scenarios\/[^/]+\/(examples|templates)\//,
                include: path.join(__dirname, 'src/scenarios/'),
                use: [
                    {
                        loader: 'raw-loader',
                        options: {
                            esModule: true,
                        },
                    },
                ],
            },
            {
                test: /\/scenarios\/[^/]+\/assets\//,
                include: path.join(__dirname, 'src/scenarios/'),
                loader: 'ignore-loader',
            },
            {
                test: /\.css$/,
                loader: 'css-loader',
                options: {
                    url: false,
                },
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                exclude: path.join(__dirname, 'src/scenarios/'),
                loader: 'file-loader',
                options: {
                    name: '/assets/[name].[ext]',
                },
            },
        ]
    },

    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
        }),
        new CopyPlugin(staticFiles),
    ],

    devServer: {
        watchContentBase: true,
        compress: true,
        port: 9000,
        publicPath: '/',
        historyApiFallback: true,
        disableHostCheck: true,
        stats: {
            children: false,
            maxModules: 0,
        },
        clientLogLevel: "warning",
    },
};