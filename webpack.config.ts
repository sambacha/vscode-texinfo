import * as path from 'path';
import * as webpack from 'webpack';

const config: webpack.Configuration = {
    target: 'node',
    entry: './src/extension.ts',
    output: {
        path: path.resolve(__dirname, 'out'),
        filename: 'extension.js',
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate: '../[resource-path]',
    },
    devtool: 'source-map',
    optimization: {
        concatenateModules: true,
        innerGraph: true,
        mergeDuplicateChunks: true,
        mangleExports: true,
        minimize: true,
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
