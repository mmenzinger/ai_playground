const path = require('path');
const webpack = require("webpack");
const CopyPlugin = require('copy-webpack-plugin');

const staticFiles = [
    'srcdoc.html',
    //'.htaccess',
    //{from: 'src/scenarios/test.js', to: 'test.js'}
    //'service-worker.js',
    //{from: 'node_modules/workbox-sw/build/workbox-sw.js', to: 'workbox-sw.js'},
];


module.exports = {
    entry: {
        'app': './src/components/ai-app.js',
        'sandbox': './src/sandbox.js',
        'service-worker': './src/service-worker.js',
        'scenario-worker': './src/scenario-worker.js',
        //'test': './src/scenarios/test.js',
    },

    output: {
        //globalObject: 'this',
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },

    resolve: {
        alias: {
            'node_modules': path.join(__dirname, 'node_modules'),
            'src': path.join(__dirname, 'src'),
            'actions': path.join(__dirname, 'src/actions'),
            'components': path.join(__dirname, 'src/components'),
            'reducers': path.join(__dirname, 'src/reducers'),
            'classes': path.join(__dirname, 'src/classes'),
        }
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['css-loader'],
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loader: "file-loader?name=/icons/[name].[ext]"
            },
        ]
    },

    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new CopyPlugin(staticFiles),
    ],

    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000,
        publicPath: '/',
        historyApiFallback: true,
        disableHostCheck: true,
        stats: {
            children: false,
            maxModules: 0,
        },
    }
};