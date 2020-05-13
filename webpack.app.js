const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const flowRemoveTypes = require('flow-remove-types');
//const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const staticFiles = [
    //'srcdoc.html',
    'index.html',
    { from: './src/iframe/*.html', to: 'iframe/[name].[ext]' },
    { from: './src/iframe/*.js', to: 'iframe/[name].[ext]', 
        transform(content, path){
            return flowRemoveTypes(content.toString()).toString();
        }
    },
    { from: 'assets', to: 'assets' },
    //{ from: 'node_modules/monaco-editor', to: 'monaco-editor' },
    { from: 'node_modules/monaco-editor/min/vs/loader.js', to: 'iframe/monaco-editor/min/vs/loader.js' },
    { from: 'node_modules/monaco-editor/min/vs/base', to: 'iframe/monaco-editor/min/vs/base' },
    { from: 'node_modules/monaco-editor/min/vs/basic-languages/javascript', to: 'iframe/monaco-editor/min/vs/basic-languages/javascript' },
    { from: 'node_modules/monaco-editor/min/vs/basic-languages/markdown', to: 'iframe/monaco-editor/min/vs/basic-languages/markdown' },
    { from: 'node_modules/monaco-editor/min/vs/editor/editor.main.js', to: 'iframe/monaco-editor/min/vs/editor/editor.main.js' },
    { from: 'node_modules/monaco-editor/min/vs/editor/editor.main.css', to: 'iframe/monaco-editor/min/vs/editor/editor.main.css' },
    { from: 'node_modules/monaco-editor/min/vs/editor/editor.main.nls.js', to: 'iframe/monaco-editor/min/vs/editor/editor.main.nls.js' },
    { from: 'node_modules/monaco-editor/min/vs/language/typescript', to: 'iframe/monaco-editor/min/vs/language/typescript' },
    { from: 'node_modules/monaco-editor/min/vs/language/json', to: 'iframe/monaco-editor/min/vs/language/json' },
    { from: 'node_modules/jstree/dist/jstree.min.js', to: 'iframe/jstree/jstree.min.js' },
    { from: 'node_modules/jstree/dist/themes/default/style.min.css', to: 'iframe/jstree/jstree.min.css' },
    { from: 'node_modules/jstree/dist/themes/default/32px.png', to: 'iframe/jstree/32px.png' },
    { from: 'node_modules/jstree/dist/themes/default/throbber.gif', to: 'iframe/jstree/throbber.gif' },
    { from: 'node_modules/jquery/dist/jquery.min.js', to: 'iframe/jquery.min.js' },
];

const alias = require('./webpack.alias.js');

module.exports = {
    entry: {
        'app': './src/component/ai-app.js',
        'service-worker': './src/worker/service-worker.js',
        'scenario-worker': './src/worker/scenario-worker.js',
    },

    output: {
        filename: '[name].js',
    },

    resolve: {
        alias,
        extensions: ['.ts', '.js'],
    },

    module: {
        rules: [
            {
                test: /\.js$/,
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
                loader: 'lit-css-loader'
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
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
        }),
        new CopyPlugin(staticFiles),
        //new MonacoWebpackPlugin({
        //    publicPath: 'monaco',
        //    languages: ['javascript', 'json', 'markdown'],
        //}),
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