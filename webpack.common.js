const path = require('path');
const webpack = require("webpack");
const CopyPlugin = require('copy-webpack-plugin');

const staticFiles = [
    'srcdoc.html',
    //'node_modules/ml5/dist/ml5.min.js',
    //'ml5js/dist/ml5.min.js',
    //'./src/tau-prolog.js',
    'node_modules/@tensorflow/tfjs/dist/tf.min.js',
    { from: 'assets', to: 'assets' },
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
        'tau-prolog': './src/tau-prolog.js',
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
            'scenarios': path.join(__dirname, 'src/components/scenarios'),
            'assets': path.join(__dirname, 'assets'),
        }
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                //use: ['css-loader'],
                loader: 'css-loader',
                options: { url: false }
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loader: "file-loader?name=/assets/[name].[ext]"
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
        clientLogLevel: "warning",
    },

    node: {
        fs: 'empty',
        child_process: 'empty',
    }
};