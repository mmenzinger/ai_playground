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
    //{ from: 'dist_rollup', to: '' },
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
                test: /(examples|templates)\/[^/]+\/.+\.js$/,
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
                test: /\.css$/,
                //use: ['css-loader'],
                loader: 'css-loader',
                options: {
                    url: false,
                },
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
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