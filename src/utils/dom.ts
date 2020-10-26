/**
 * utils/dom.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as htmlparser from 'node-html-parser';
import { Operator } from './types';

/**
 * DOM manipulation utilities.
 */
export default class DOM {

    private dom?: htmlparser.HTMLElement;

    private changed = false;

    private get value() {
        return this.dom ??= htmlparser.parse(this.html);
    }

    get outerHTML() {
        if (this.changed) {
            this.html = this.value.outerHTML;
            this.changed = false;
        }
        return this.html;
    }

    /**
     * Transform and replace the `src` attribute value of all `img` elements from HTML using given function.
     * 
     * @param transformer 
     */
    transformImageUri(transformer: Operator<string>) {
        const elements = this.value.querySelectorAll('img');
        if (elements.length === 0) return;
        elements.forEach(element => {
            const src = element.getAttribute('src');
            src && element.setAttribute('src', transformer(src));
        });
        this.changed = true;
    }

    insertScript(script: string) {
        this.value.querySelector('head').insertAdjacentHTML('beforeend', `<script>${script}</script>`);
        this.changed = true;
    }

    constructor(private html: string) {}
}
