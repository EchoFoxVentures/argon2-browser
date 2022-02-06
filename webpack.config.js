const webpack = require('webpack');
const path = require('path');

module.exports = {
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
        filename: 'argon2-bundled.min.js',
    },
    module: {
        noParse: /\.wasm$/,
        rules: [
            {
                test: /\.wasm$/,
                loader: 'base64-loader',
                type: 'javascript/auto',
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            IS_WASM_INLINED: true,
        }),
    ],
    resolve: {
        fallback: {
            path: false,
            fs: false,
            Buffer: false,
            process: false,
        },
    },
};
