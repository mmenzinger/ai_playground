const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const staticFiles = [
    { from: './src/index.html' },
    // { from: './src/iframe/*.html', to: '[name].[ext]' },
    { from: './public/assets', to: 'assets' },
    // { from: 'node_modules/@tensorflow/tfjs-core/dist/' },
    // { from: './src/worker/scenario-worker.ts', to: 'scenario-worker.js' },
];

const alias = {
    '@src': path.join(__dirname, 'src'),
    '@store': path.join(__dirname, 'src/store'),
    '@localdb': path.join(__dirname, 'src/localdb'),
    '@utils': path.join(__dirname, 'src/utils'),
    '@worker': path.join(__dirname, 'src/worker'),
    '@modal': path.join(__dirname, 'src/components/modal'),
    '@elements': path.join(__dirname, 'src/components/elements'),
    '@pages': path.join(__dirname, 'src/components/pages'),

    node_modules: path.join(__dirname, 'node_modules'),
};

module.exports = {
    entry: {
        app: './src/index.tsx',
        'scenario-worker': './src/worker/scenario-worker',
        'lib/utils': './src/lib/utils',
        // 'lib/prolog': './src/lib/prolog',
        // 'lib/tensorflow': './src/lib/tensorflow',
    },

    output: {
        filename: '[name].js',
        library: 'LIB',
        libraryTarget: 'var',
    },

    resolve: {
        alias,
        extensions: ['.ts', '.js', '.mjs', '.tsx', '.jsx'],
    },

    module: {
        rules: [
            {
                test: /\.(ts|js|mjs)x?$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.(js|pl|md|json)$/,
                include: path.join(__dirname, 'src/scenario/'),
                use: ['raw-loader'],
            },
            {
                test: /\.(png|jpg|gif)$/,
                include: path.join(__dirname, 'src/scenario/'),
                use: ['url-loader'],
            },
            {
                test: /\.s[ac]ss$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.css$/,
                exclude: /\.module\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.module\.css$/,
                include: path.join(__dirname, 'src/'),
                use: [
                    'style-loader',
                    {
                        loader: '@teamsupercell/typings-for-css-modules-loader',
                        options: {
                            banner: '// autogenerated by typings-for-css-modules-loader.\n// Do not change this file manually!\n',
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: { modules: true },
                    },
                ],
            },
            {
                test: /\.(jpe?g|png|gif|svg|ttf)$/i,
                exclude: path.join(__dirname, 'src/scenario/'),
                loader: 'file-loader',
                options: {
                    name: '/assets/[name].[ext]',
                },
            },
        ],
    },

    plugins: [
        new CopyPlugin({ patterns: staticFiles }),
        new FaviconsWebpackPlugin({
            logo: './public/assets/logo.png',
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
                    yandex: false,
                },
            },
        }),
        new MonacoWebpackPlugin({
            // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
            languages: ['javascript', 'json', 'markdown'],
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
        clientLogLevel: 'warning',
    },
};
