import path from 'path';
import rollupCommonjs from 'rollup-plugin-commonjs';
import rollupResolve from 'rollup-plugin-node-resolve';
import rollupJson from '@rollup/plugin-json';

if (!process.env.TARGET) {
    throw new Error('TARGET package must be specified via --environment flag.');
}

const target = process.env.TARGET;
const packageDir = path.resolve(__dirname, 'packages', target);

export default {
    input: path.resolve(packageDir, `src/index.js`),
    output: {
        file: path.resolve(packageDir, `dist/index.js`),
        format: 'cjs',
    },
    plugins: [
        rollupJson({ namedExports: false }),
        rollupResolve(),
        rollupCommonjs({
            exclude: 'node_modules/**',
        }),
    ],
    treeshake: {
        moduleSideEffects: false,
    },
};
