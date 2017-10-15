'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    context: __dirname,
    entry: './src/index.jsx',
    output: {
        path: __dirname + '/static',
        filename: 'bundle.js',
    },
    module: {
        rules: [
            { enforce: 'pre', test: /\.jsx$/, exclude: /node_modules/, loader: 'eslint-loader' },
            { test: /\.jsx?$/, exclude: /node_modules/, loaders: ['babel-loader'] },
            { include: /\.json$/, loaders: ['json-loader'] },
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: false,
            minify: {
                collapseBooleanAttributes: true,
                collapseInlineTagWhitespace: true,
                collapseWhitespace: true,
                minifyCSS: true,
                minifyJS: true,
                removeAttributeQuotes: true,
                removeComments: true,
                removeOptionalTags: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                sortAttributes: true,
                sortClassName: true,
                useShortDoctype: true,
                removeTagWhitespace: true,
                trimCustomFragments: true
            },
            hash: false
        })
    ],
    devtool: 'cheap-module-source-map',
};
