const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
// const { InjectManifest } = require('workbox-webpack-plugin');
const EsmWebpackPlugin = require('@purtuga/esm-webpack-plugin');
const glob = require('glob');

const staticFiles = [
    { from: './src/iframe/*.html', to: '[name].[ext]' },
    { from: 'assets', to: 'assets' },
    { from: 'node_modules/jstree/dist/jstree.min.js', to: 'jstree/jstree.min.js' },
    { from: 'node_modules/jstree/dist/themes/default/style.min.css', to: 'jstree/jstree.min.css' },
    { from: 'node_modules/jstree/dist/themes/default/32px.png', to: 'jstree/32px.png' },
    { from: 'node_modules/jstree/dist/themes/default/throbber.gif', to: 'jstree/throbber.gif' },
    { from: 'node_modules/jquery/dist/jquery.min.js', to: 'jstree/jquery.min.js' },
];

const alias = {
    '@src': path.join(__dirname, 'src'),
    '@store': path.join(__dirname, 'src/store'),
    '@doc': path.join(__dirname, 'src/doc'),
    '@localdb': path.join(__dirname, 'src/localdb'),
    '@util': path.join(__dirname, 'src/util'),
    '@lib': path.join(__dirname, 'src/lib'),
    '@sandbox': path.join(__dirname, 'src/sandbox'),
    '@shared-styles': path.join(__dirname, 'src/component/shared-styles.css'),
    '@component': path.join(__dirname, 'src/component'),
    '@worker': path.join(__dirname, 'src/worker'),
    '@modal': path.join(__dirname, 'src/component/modal'),
    '@element': path.join(__dirname, 'src/component/element'),
    '@page': path.join(__dirname, 'src/component/page'),
    '@scenario': path.join(__dirname, 'src/scenario'),

    'node_modules': path.join(__dirname, 'node_modules'),
    'mobx': path.join(__dirname + '/node_modules/mobx/lib/mobx.es6.js'),
};

module.exports = {
    entry: {
        'app': './src/component/ai-app',
        'scenario-worker': './src/worker/scenario-worker',
        'monaco': './src/iframe/monaco',
        'jstree': './src/iframe/jstree',
        'monaco/editor-worker': 'monaco-editor/esm/vs/editor/editor.worker',
        'monaco/json-worker': 'monaco-editor/esm/vs/language/json/json.worker',
        'monaco/ts-worker': 'monaco-editor/esm/vs/language/typescript/ts.worker',
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
                test: /\.(js|pl|md|json)$/,
                include: path.join(__dirname, 'src/scenario/'),
                use: [
                    {
                        loader: 'raw-loader',
                    },
                ],
            },
            {
                test: /\.(png|jpg|gif)$/,
                include: path.join(__dirname, 'src/scenario/'),
                use: [
                    {
                        loader: 'url-loader',
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
        // new PreloadWebpackPlugin({
        //     rel: 'prefetch',
        //     include: 'allAssets',
        // }),
        // new InjectManifest({
        //     swSrc: './src/worker/service-worker.ts',
        //     additionalManifestEntries: [
        //         {url: 'scenario/util.js', revision: null},
        //         {url: 'lib/prolog.js', revision: null},
        //         {url: 'lib/tensorflow.js', revision: null},
        //     ],
        //     maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // monaco has huge file sizes uncompressed...
        // }),
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
        new EsmWebpackPlugin({
            exclude(fileName, chunck) {
                // exclude all non library files
                return !/^lib\/.+.\.js$/i.test(fileName);
            }
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