/**
 * converter.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import { Options } from './options';
import { exec } from './utils';

/**
 * Texinfo to HTML converter.
 */
export class Converter {

    /**
     * Convert a texinfo document to HTML.
     * 
     * @param path Path to the Texinfo document to be converted.
     */
    static async convert(path: string) {
        const converter = new Converter(path);
        return await converter.convert();
    }

    /**
     * The options to be passed to the `makeinfo` command.
     */
    private readonly options = ['-o', '-', '--no-split', '--html'];

    private constructor(path: string) {
        if (Options.noHeaders) {
            this.options.push('--no-headers');
        }
        if (Options.force) {
            this.options.push('--force');
        }
        if (Options.noValidate) {
            this.options.push('--no-validate');
        }
        if (Options.noWarn) {
            this.options.push('--no-warn');
        }
        this.options.push(`--error-limit=${Options.errorLimit}`);
        this.options.push(path);
    }

    private async convert() {
        const makeinfo = Options.makeinfo;
        const maxBuffer = Options.maxSize * 1024 * 1024;
        return await exec(makeinfo, this.options, maxBuffer);
    }
}
