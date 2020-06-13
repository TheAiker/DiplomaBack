const { resolve } = require('path');
const nodeExtenals = require('webpack-node-externals');
const root = (...path) => resolve(__dirname, ...path);

module.exports = {
    entry: root('src/main'),

    output: {
        path: root('dist/'),
        filename: 'server.js'
    },

    target: 'node',
    externals: [nodeExtenals()],

    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            }
        ]
    },

    optimization: {
        minimize: false
    },

    resolve: {
        extensions: ['.ts', '.js', '.json']
    },

    node: {
        __dirname: false,
        __filename: false
    }

};
