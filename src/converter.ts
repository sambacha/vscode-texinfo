/**
 * converter.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import { Options } from './options';
import * as utils from './utils';

/**
 * Texinfo to HTML converter.
 */
export class Converter {

    /**
     * Convert a Texinfo document to HTML.
     * 
     * @param path Path to the Texinfo document.
     * @yields HTML code, or `undefined` if conversion fails.
     */
    static async convertToHtml(path: string) {
        return await new Converter().convert(path);
    }

    /**
     * The options to be passed to the `makeinfo` command.
     */
    private readonly options = ['-o', '-', '--no-split', '--html'];

    private constructor() {
        Options.noHeaders && this.options.push('--no-headers');
        Options.force && this.options.push('--force');
        Options.noValidate && this.options.push('--no-validate');
        Options.noWarn && this.options.push('--no-warn');
        this.options.push(`--error-limit=${Options.errorLimit}`);
    }

    private async convert(path: string) {
        const makeinfo = Options.makeinfo;
        const maxBuffer = Options.maxSize * 1024 * 1024;
        return await utils.exec(makeinfo, this.options.concat(path), maxBuffer);
    }
}
