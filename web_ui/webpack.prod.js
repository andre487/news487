'use strict';

const commonConfig = require('./webpack.common');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

const BrotliPlugin = require('brotli-webpack-plugin');
const ZopfliPlugin = require('zopfli-webpack-plugin');

module.exports = merge(commonConfig, {
    plugins: [
        new CleanWebpackPlugin(['build']),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"production"'
            }
        }),
        new HtmlWebpackPlugin({
            template: './src/index.ejs',
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
            hash: true
        }),

        new UglifyJSPlugin(),
        new ZopfliPlugin({
            threshold: 10240
        }),
        new BrotliPlugin({
            threshold: 10240
        })
    ]
});
