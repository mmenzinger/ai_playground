const path = require('path');
const webpack = require("webpack");
const CopyPlugin = require('copy-webpack-plugin');
const WorkerPlugin = require('worker-plugin');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');

const staticFiles = [
    'srcdoc.html',
    //'node_modules/ml5/dist/ml5.min.js',
    //'ml5js/dist/ml5.min.js',
    //'./src/tau-prolog.js',
    'node_modules/@tensorflow/tfjs/dist/tf.min.js',
    //'node_modules/ml5/dist/ml5.min.js',
    { from: 'assets', to: 'assets' },
    { from: './src/scenarios/ai-tictactoe-scenario.js', to: 'scenario/tictactoe.js'},
    //{ from: './src/worker/scenario.worker.js', to: 'scenario.worker.js'},
    //'.htaccess',
    //{from: 'src/scenarios/test.js', to: 'test.js'}
    //'service-worker.js',
    //{from: 'node_modules/workbox-sw/build/workbox-sw.js', to: 'workbox-sw.js'},
];


module.exports = {
    entry: {
        'app': './src/components/ai-app.js',
        'sandbox': './src/sandbox.js',
        //'service-worker': './src/worker/service.worker.js',
        //'util.worker': './src/worker/util.worker.js',
        //'scenario-worker': './src/worker/scenario.worker.js',
        'tau-prolog': './src/libs/tau-prolog.worker.js',
        //'ml5': './src/libs/ml5.js',
        'tf': './src/libs/tf.worker.js',

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
            'scenarios': path.join(__dirname, 'src/scenarios'),
            'assets': path.join(__dirname, 'assets'),
            'templates': path.join(__dirname, 'src/scenarios/templates'),
            'libs': path.join(__dirname, 'src/libs'),
            'worker': path.join(__dirname, 'src/worker'),
        }
    },

    module: {
        rules: [
            /*{
                test: /\.worker\.js$/,
                use: {
                    loader: 'worker-loader',
                    options: { 
                        inline: true,
                        fallback: false,
                    },
                }
                
            },*/
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
                loader: 'file-loader?name=/assets/[name].[ext]',
            },
        ]
    },

    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            //"window.jQuery": "jquery"
        }),
        new CopyPlugin(staticFiles),
        new WorkerPlugin(),
        new ServiceWorkerWebpackPlugin({
            entry: path.join(__dirname, 'src/worker/service.worker.js'),
        }),
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