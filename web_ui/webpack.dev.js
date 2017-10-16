'use strict';

const commonConfig = require('./webpack.common');
const merge = require('webpack-merge');
const webpack = require('webpack');

module.exports = merge(commonConfig, {
    module: {
        rules: [
            { enforce: 'pre', test: /\.jsx$/, exclude: /node_modules/, loader: 'eslint-loader' },
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"development"'
            }
        })
    ]
});
