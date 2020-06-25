const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.app.js');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');

const app = require('./webpack.app.js');
const modules = require('./webpack.modules.js');

const config = {
    mode: 'production',

    output: {
        path: path.resolve(__dirname, 'build/prod'),
    },

    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },

    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: true,
        }),
    ],

    performance: {
        maxAssetSize: 1024000,
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|examples|templates)/,
                use: {
                    loader: 'minify-lit-html-loader',
                    options: {
                        htmlMinifier: {
                            ignoreCustomFragments: [
                                /[@?]\w+=\${.*?(\s*})+/,
                            ]
                        }
                    }
                }
            },
        ],
    },

    devServer: {
        contentBase: path.join(__dirname, 'build/prod'),
    },
};

const appConfig = {
    ...config,
    plugins: [
        ...config.plugins,
        new InjectManifest({
            swSrc: './src/worker/service-worker.ts',
            additionalManifestEntries: [
                {url: 'lib/utils.js', revision: null},
                {url: 'lib/prolog.js', revision: null},
                {url: 'lib/tensorflow.js', revision: null},
            ],
            maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // monaco has huge file sizes...
        }),
    ],
}

module.exports = [
    merge(app, appConfig),
    merge(modules, config),
];