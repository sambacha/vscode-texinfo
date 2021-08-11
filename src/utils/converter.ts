/**
 * utils/converter.ts
 *
 * Copyright (C) 2020,2021  CismonX <admin@cismon.net>
 *
 * This file is part of vscode-texinfo.
 *
 * vscode-texinfo is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * vscode-texinfo is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * vscode-texinfo.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as path from 'path';
import * as vscode from 'vscode';
import Logger from '../logger';
import Options from '../options';
import { exec } from './misc';
import { Operator } from './types';

/**
 * Converter which converts file from Texinfo to other formats.
 */
export default class Converter
{
    async toHTML(imgTransformer: Operator<vscode.Uri>, insertScript?: string) {
        const pathUri = vscode.Uri.file(path.dirname(this._path));
        const newPath = imgTransformer(pathUri).toString() + '/';
        const options = ['-o-', '--no-split', '--html',
            `--error-limit=${this._options.errorLimit}`,
            `--init-file=${this._initFile}`,
            '-D', `__vscode_texinfo_image_uri_base ${newPath}`,
        ];
        this._options.noHeaders && options.push('--no-headers');
        this._options.noNumberSections && options.push('--no-number-sections');
        this._options.noValidation && options.push('--no-validate');
        this._options.noWarnings && options.push('--no-warn');
        if (insertScript !== undefined) {
            options.push('-c', `EXTRA_HEAD <script>${insertScript}</script>`);
        }
        this._addIncludePaths(this._options.includePaths, options);
        this._defineVariables(this._options.variables, options);
        this._includeCustomCSS(this._options.customCSS, options);
        return await exec(
            this._options.makeinfo,
            options.concat(this._path),
            this._options.maxSize,
        );
    }

    constructor(
        private readonly _path: string,
        private readonly _initFile: string,
        private readonly _options: Options,
        private readonly _logger: Logger,
    ) {}

    private _addIncludePaths(paths: readonly string[], options: string[]) {
        const separator = process.platform === 'win32' ? ';' : ':';
        options.push('-I', paths.join(separator));
    }

    private _defineVariables(variables: readonly string[], options: string[]) {
        variables.forEach(varName => options.push('-D', varName));
    }

    private _includeCustomCSS(cssFileURI: string, options: string[]) {
        if (!cssFileURI) return;
        try {
            const uri = vscode.Uri.parse(cssFileURI, true);
            switch (uri.scheme) {
                case 'file':
                    options.push(`--css-include=${uri.path}`);
                    break;
                case 'http':
                case 'https':
                    options.push(`--css-ref=${uri.toString()}`);
                    break;
                default:
                    throw URIError;
            }
        } catch (e) {
            this._logger
                .log(`Cannot load custom CSS. Invalid URI: '${cssFileURI}'`);
        }
    }
}
