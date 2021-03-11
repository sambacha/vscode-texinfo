/**
 * utils/converter.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
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

    async convertToHtml(
        imgTransformer?: Operator<string>,
        insertScript?: string,
    ) {
        const options = ['-o', '-', '--no-split', '--html', `--error-limit=${Options.errorLimit}`];
        Options.noHeaders && options.push('--no-headers');
        Options.force && options.push('--force');
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
