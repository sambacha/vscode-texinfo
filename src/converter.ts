/**
 * converter.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import Options from './options';
import { exec } from './utils';

/**
 * Texinfo to HTML converter.
 */
export default class Converter {

    /**
     * Convert a Texinfo document to HTML.
     * 
     * @param path Path to the Texinfo document.
     * @returns HTML code, or `undefined` if conversion fails.
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
        Options.noValidation && this.options.push('--no-validate');
        Options.noWarnings && this.options.push('--no-warn');
        this.options.push(`--error-limit=${Options.errorLimit}`);
    }

    private async convert(path: string) {
        const maxBuffer = Options.maxSize * 1024 * 1024;
        return await exec(Options.makeinfo, this.options.concat(path), maxBuffer);
    }
}
