const path = require('path');
const webpack = require("webpack");
const CopyPlugin = require('copy-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const staticFiles = [
    //'srcdoc.html',
    'index.html',
    { from: './src/iframes/*', to: 'iframes/[name].[ext]' },
    { from: 'assets', to: 'assets' },
    //{ from: 'node_modules/monaco-editor', to: 'monaco-editor' },
    {
        from: './src/scenarios/*/assets/*',
        to: 'assets/[1]/[name].[ext]',
        test: /([^/]+)\/assets\/[^/]+$/,
    },
    { from: 'node_modules/monaco-editor/min/vs/loader.js', to: 'iframes/monaco-editor/min/vs/loader.js' },
    { from: 'node_modules/monaco-editor/min/vs/base', to: 'iframes/monaco-editor/min/vs/base' },
    { from: 'node_modules/monaco-editor/min/vs/basic-languages/javascript', to: 'iframes/monaco-editor/min/vs/basic-languages/javascript' },
    { from: 'node_modules/monaco-editor/min/vs/basic-languages/markdown', to: 'iframes/monaco-editor/min/vs/basic-languages/markdown' },
    { from: 'node_modules/monaco-editor/min/vs/editor/editor.main.js', to: 'iframes/monaco-editor/min/vs/editor/editor.main.js' },
    { from: 'node_modules/monaco-editor/min/vs/editor/editor.main.css', to: 'iframes/monaco-editor/min/vs/editor/editor.main.css' },
    { from: 'node_modules/monaco-editor/min/vs/editor/editor.main.nls.js', to: 'iframes/monaco-editor/min/vs/editor/editor.main.nls.js' },
    { from: 'node_modules/monaco-editor/min/vs/language/typescript', to: 'iframes/monaco-editor/min/vs/language/typescript' },
    { from: 'node_modules/monaco-editor/min/vs/language/json', to: 'iframes/monaco-editor/min/vs/language/json' },
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
                test: /\.(jpe?g|png|gif|svg|ttf)$/i,
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
        /*new MonacoWebpackPlugin({
            publicPath: 'monaco',
            languages: ['javascript', 'json', 'markdown'],
        }),*/
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