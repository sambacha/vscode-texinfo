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

import * as vscode from 'vscode';
import Logger from '../logger';
import Options from '../options';
import DOM from './dom';
import { exec } from './misc';
import { Operator } from './types';

/**
 * Converter which converts file from Texinfo to other formats.
 */
export default class Converter {

    private includeCustomCSS(cssFileURI: string, options: string[]) {
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
            Logger.log(`Cannot load custom CSS. Invalid URI: '${cssFileURI}'`);
        }
    }

    constructor(private readonly path: string) {}

    async convertToHtml(imgTransformer?: Operator<string>, insertScript?: string) {
        const options = ['-o', '-', '--no-split', '--html', `--error-limit=${Options.errorLimit}`];
        Options.noHeaders && options.push('--no-headers');
        Options.noValidation && options.push('--no-validate');
        Options.noWarnings && options.push('--no-warn');
        Options.customCSS && this.includeCustomCSS(Options.customCSS, options);
        const result = await exec(Options.makeinfo, options.concat(this.path), Options.maxSize);
        if (result.data !== undefined) {
            // No worry about performance here, as the DOM is lazily initialized.
            const dom = new DOM(result.data);
            imgTransformer && dom.transformImageUri(imgTransformer);
            insertScript && dom.insertScript(insertScript);
            result.data = dom.outerHTML;
        }
        return result;
    }
}
