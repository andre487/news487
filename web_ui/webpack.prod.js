'use strict';

const commonConfig = require('./webpack.common');
const CleanWebpackPlugin = require('clean-webpack-plugin');
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
        new UglifyJSPlugin(),
        new ZopfliPlugin(),
        new BrotliPlugin()
    ]
});
