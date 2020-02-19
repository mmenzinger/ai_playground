import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import setAlias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';

const alias = require('./webpack.alias.js');
const glob = require('glob');
const path = require('path');


let OUTPUT_DIR = path.join(__dirname, 'build/dev');


const plugins = [
    resolve({
        mainFields: ['browser', 'jsnext', 'module', 'main'],
    }),
    commonjs(),
    setAlias({
        entries: Object.entries(alias).map(e => ({ find: e[0], replacement: e[1]})),
    }),
];

function packFile(input, file, format = 'esm', additional_plugins = []) {
    return packGlobalFile(path.join(__dirname, input), file, format, additional_plugins);
}

function packGlobalFile(input, file, format = 'esm', additional_plugins = []){
    return {
        input,
        output: {
            file: path.join(OUTPUT_DIR, file),
            format: format,
            sourceMap: 'inline',
        },
        plugins: [...plugins, ...additional_plugins],
        watch: {
            exclude: ['node_modules/**']
        },
    };
}

function getScenarioModules() {
    const files = glob.sync(path.join(__dirname, 'src/scenarios/*/scenario.js'));
    return files.map(file => packGlobalFile(file, file.replace(path.join(__dirname, 'src'), '')));
}

export default async args => {
    if (args.configProd) {
        OUTPUT_DIR = path.join(__dirname, 'build/prod');
        // use terser to minify in production
        plugins.push(terser());
    }

    return [
        packFile('src/libs/tau-prolog.js', 'libs/prolog.js'),
        packFile('src/libs/tf.js', 'libs/tensorflow.js'),
        packFile('src/sandbox.js', 'sandbox.js'),
        packFile('src/worker/scenario.worker.js', 'scenario.worker.js'),
        args.configProd
            ? packFile('src/worker/service.worker.js', 'service-worker.js', 'esm', [replace({'process.env.NODE_ENV': "'production'"})])
            : packFile('src/worker/service.worker.dev.js', 'service-worker.js', 'esm', [replace({'process.env.NODE_ENV': "'development'"})]),
        ...getScenarioModules(),
    ];
}