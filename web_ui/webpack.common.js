'use strict';

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
    plugins: [],
    devtool: 'cheap-module-source-map',
};
