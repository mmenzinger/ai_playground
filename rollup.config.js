import typescript from 'rollup-plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const files = [
    ['./src/lib/utils.ts', './src/lib/utils.js'],
    [
        './src/components/elements/simulator/utils.ts',
        './public/simulator/utils.js',
    ],
];

export default files.map((file, index) => ({
    input: file[0],
    output: {
        file: file[1],
        format: 'esm',
    },
    plugins: [
        nodeResolve({ browser: true }),
        typescript(),
        commonjs(),
        terser(),
    ],
}));
