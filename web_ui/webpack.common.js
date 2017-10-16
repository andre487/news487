'use strict';

const webpack = require('webpack');

const apiHost = process.env.SCRAPPER_487_API_URL;
if (!apiHost) {
    throw new Error('You should provide SCRAPPER_487_API_URL env var');
}

module.exports = {
    context: __dirname,
    entry: './src/index.jsx',
    output: {
        path: __dirname + '/build',
        filename: 'bundle.js',
    },
    module: {
        rules: [
            { test: /\.jsx?$/, exclude: /node_modules/, loaders: ['babel-loader'] },
            { test: /\.css?$/, loaders: ['style-loader', 'css-loader'] },
            { include: /\.json$/, loaders: ['json-loader'] },
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'API_URL': `"${apiHost}"`
            }
        }),
    ],
    devtool: 'cheap-module-source-map',
};
