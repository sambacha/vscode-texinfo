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
export default class Converter {

    async toHTML(imgTransformer: Operator<vscode.Uri>, insertScript?: string) {
        const newPath = imgTransformer(vscode.Uri.file(path.dirname(this.path))).toString() + '/';
        const options = ['-o-', '--no-split', '--html', `--error-limit=${this.options.errorLimit}`,
            `--init-file=${this.initFile}`, '-D', `__vscode_texinfo_image_uri_base ${newPath}`];
        this.options.noHeaders && options.push('--no-headers');
        this.options.noNumberSections && options.push('--no-number-sections');
        this.options.noValidation && options.push('--no-validate');
        this.options.noWarnings && options.push('--no-warn');
        if (insertScript !== undefined) {
            options.push('--set-customization-variable', `EXTRA_HEAD <script>${insertScript}</script>`);
        }
        this.addIncludePaths(this.options.includePaths, options);
        this.defineVariables(this.options.variables, options);
        this.includeCustomCSS(this.options.customCSS, options);
        return await exec(this.options.makeinfo, options.concat(this.path), this.options.maxSize);
    }

    constructor(
        private readonly path: string,
        private readonly initFile: string,
        private readonly options: Options,
        private readonly logger: Logger,
    ) {}

    private addIncludePaths(paths: readonly string[], options: string[]) {
        const separator = process.platform === 'win32' ? ';' : ':';
        options.push('-I', paths.join(separator));
    }

    private defineVariables(variables: readonly string[], options: string[]) {
        variables.forEach(varName => options.push('-D', varName));
    }

    private includeCustomCSS(cssFileURI: string, options: string[]) {
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
            this.logger.log(`Cannot load custom CSS. Invalid URI: '${cssFileURI}'`);
        }
    }
}
