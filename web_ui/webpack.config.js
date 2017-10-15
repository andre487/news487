'use strict';

module.exports = {
    context: __dirname,
    entry: {
        jsx: './src/index.jsx',
        html: './src/index.html',
    },
    output: {
        path: __dirname + '/static',
        filename: 'bundle.js',
    },
    module: {
        preLoaders: [
            //Eslint loader
            { test: /\.jsx?$/, exclude: /node_modules/, loader: 'eslint-loader' },
        ],
        loaders: [
            { test: /\.html$/, loader: 'file?name=[name].[ext]' },
            { test: /\.jsx?$/, exclude: /node_modules/, loaders: ['babel-loader'] },
            { include: /\.json$/, loaders: ['json-loader'] },
        ],
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    eslint: {
        configFile: './.eslintrc'
    },
};
