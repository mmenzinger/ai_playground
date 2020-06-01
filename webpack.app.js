const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PreloadWebpackPlugin = require('preload-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

const staticFiles = [
    { from: './src/iframe/*.html', to: '[name].[ext]' },
    { from: 'assets', to: 'assets' },
    { from: 'node_modules/jstree/dist/jstree.min.js', to: 'jstree/jstree.min.js' },
    { from: 'node_modules/jstree/dist/themes/default/style.min.css', to: 'jstree/jstree.min.css' },
    { from: 'node_modules/jstree/dist/themes/default/32px.png', to: 'jstree/32px.png' },
    { from: 'node_modules/jstree/dist/themes/default/throbber.gif', to: 'jstree/throbber.gif' },
    { from: 'node_modules/jquery/dist/jquery.min.js', to: 'jstree/jquery.min.js' },
];

const alias = require('./webpack.alias.js');

module.exports = {
    entry: {
        'app': './src/component/ai-app',
        'service-worker': './src/worker/service-worker',
        'scenario-worker': './src/worker/scenario-worker',
        'monaco': './src/iframe/monaco',
        'jstree': './src/iframe/jstree',
        'monaco/editor-worker': 'monaco-editor/esm/vs/editor/editor.worker',
        'monaco/json-worker': 'monaco-editor/esm/vs/language/json/json.worker',
        'monaco/ts-worker': 'monaco-editor/esm/vs/language/typescript/ts.worker',
    },

    output: {
        filename: '[name].js',
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
                test: /\/scenario\/[^/]+\/(examples|templates)\//,
                include: path.join(__dirname, 'src/scenario/'),
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
                test: /\/scenario\/[^/]+\/assets\//,
                include: path.join(__dirname, 'src/scenario/'),
                loader: 'ignore-loader',
            },
            {
                test: /\/scenario\/[^/]+\/scenario\.md$/,
                include: path.join(__dirname, 'src/scenario/'),
                use: [
                    {
                        loader: 'raw-loader',
                    },
                ],
            },
            {
                test: /\.css$/,
                include: /node_modules\/monaco-editor/,
                loader: ['style-loader', 'css-loader'],
            },
            {
                test: /\.css$/,
                exclude: /node_modules\/monaco-editor/,
                loader: 'lit-css-loader',
            },
            {
                test: /\.(jpe?g|png|gif|svg|ttf)$/i,
                exclude: path.join(__dirname, 'src/scenario/'),
                loader: 'file-loader',
                options: {
                    name: '/assets/[name].[ext]',
                },
            },
        ]
    },

    plugins: [
        new CopyPlugin(staticFiles),
        new HtmlWebpackPlugin({
            template: 'src/index.ejs',
            chunks: ['app'],
        }),
        new PreloadWebpackPlugin({
            rel: 'prefetch',
            include: 'allAssets',
        }),
        new FaviconsWebpackPlugin({
            logo: './assets/logo.png',
            cache: true,
            //publicPath: '/',
            inject: true,
            favicons: {
                appName: 'AI Coding4Fun',
                appDescription: 'AI programming framework',
                developerURL: null, // prevent retrieving from the nearest package.json
                background: '#fff',
                theme_color: '#f83',
                icons: {
                    android: false,
                    appleIcon: false,
                    appleStartup: false,
                    coast: false,
                    yandex: false
                },
            },
        }),
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