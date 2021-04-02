/**
 * Copyright (C) 2020,2021  CismonX <admin@cismon.net>
 *
 * Copying and distribution of this file, with or without modification, are
 * permitted in any medium without royalty, provided the copyright notice and
 * this notice are preserved. This file is offered as-is, without any warranty.
 */

import * as path from 'path';
import * as webpack from 'webpack';
import { argv } from 'process';
import TerserPlugin from 'terser-webpack-plugin';

const isProduction = 'production' === argv[argv.indexOf('--mode') + 1];

const config: webpack.Configuration = {
    target: 'node',
    entry: './src/extension.ts',
    output: {
        path: path.resolve(__dirname, 'out'),
        filename: 'extension.js',
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate: '../[resource-path]',
    },
    devtool: isProduction ? false : 'source-map',
    optimization: {
        concatenateModules: true,
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    compress: {
                        unsafe: true,
                    },
                    format: {
                        comments: false,
                    },
                },
            }),
        ],
    },
    externals: {
        vscode: 'commonjs vscode',
    },
    resolve: {
        extensions: ['.js', '.ts'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
        ],
    },
};

export default config;
