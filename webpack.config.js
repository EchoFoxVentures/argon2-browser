const path = require('path');

const getConfig = (inlineWasm) => ({
    mode: 'production',
    entry: './lib/argon2.js',
    output: {
        library: {
            name: 'argon2',
            type: 'umd',
        },
        globalObject: 'this',
        path: path.resolve(__dirname, 'dist'),
        publicPath: 'dist/',
        filename: inlineWasm ? 'argon2-bundled.min.js' : 'argon2.min.js',
    },
    module: {
        noParse: /\.wasm$/,
        rules: [{
            test: /\.wasm$/,
            loader: inlineWasm ? 'base64-loader' : 'null-loader',
            type: 'javascript/auto',
        }],
    },
    externals: {
        path: 'path',
        fs: 'fs',
    },
    resolve: {
        fallback: {
            path: false,
            fs: false,
            Buffer: false,
            process: false,
        },
    },
    node: false,
});

module.exports = [getConfig(true), getConfig(false)];
