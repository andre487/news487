'use strict';

const childProcess = require('child_process');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const path = require('path');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
const webpack = require('webpack');

const apiHost = process.env.SCRAPPER_487_API_URL;
if (!apiHost) {
    throw new Error('You should provide SCRAPPER_487_API_URL env var');
}

const gitHash = String(childProcess.execSync('git rev-parse HEAD')).trim();

module.exports = {
    context: __dirname,
    entry: ['babel-polyfill', './src/index.jsx'],
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            { test: /\.jsx?$/, exclude: /node_modules/, loaders: ['babel-loader'] },
            {
                test: /\.css?$/,
                loaders: [
                    {
                        loader: 'style-loader',
                        options: {
                            attrs: { nonce: gitHash }
                        }
                    },
                    'css-loader'
                ]
            },
            { test: /\.txt?$/, loaders: ['raw-loader'] },
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'API_URL': `"${apiHost}"`,
                'GIT_HASH': `"${gitHash}"`,
            }
        }),

        new CopyWebpackPlugin([{ from: 'assets' }]),

        new ServiceWorkerWebpackPlugin({
            entry: './src/service-worker.js',
            excludes: ['**/robots.txt'],
            transformOptions(options) {
                const { assets } = options;
                const newAssets = assets.filter(name => !name.endsWith('.gz') && !name.endsWith('.br'));

                newAssets.unshift('/index.html');

                return {
                    assets: newAssets,
                    gitHash
                };
            },
        }),
    ],
    devtool: 'cheap-module-source-map',
};
