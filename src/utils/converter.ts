/**
 * utils/converter.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import Options from '../options';
import DOM from './dom';
import { exec } from './misc';
import { Operator } from './types';

/**
 * Texinfo to HTML converter.
 */
export default class Converter {

    /**
     * The options to be passed to the `makeinfo` command.
     */
    private readonly options = ['-o', '-', '--no-split', '--html'];

    constructor(
        private readonly path: string,
        private readonly imgTransformer?: Operator<string>,
        private readonly insertScript?: string,
    ) {
        Options.noHeaders && this.options.push('--no-headers');
        Options.force && this.options.push('--force');
        Options.noValidation && this.options.push('--no-validate');
        Options.noWarnings && this.options.push('--no-warn');
        this.options.push(`--error-limit=${Options.errorLimit}`);
    }

    async convert() {
        const result = await exec(Options.makeinfo, this.options.concat(this.path), Options.maxSize);
        if (result.data !== undefined) {
            // No worry about performance here, as the DOM is lazily initialized.
            const dom = new DOM(result.data);
            this.imgTransformer && dom.transformImageUri(this.imgTransformer);
            this.insertScript && dom.insertScript(this.insertScript);
            result.data = dom.outerHTML;
        }
        return result;
    }
}
