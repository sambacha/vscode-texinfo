/**
 * utils/dom.ts
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

import * as htmlparser from 'node-html-parser';
import { Operator } from './types';

/**
 * Parse HTML into DOM and transform elements.
 */
export default class DOM {

    get outerHTML() {
        if (this.changed) {
            this.html = this.value.outerHTML;
            this.changed = false;
        }
        return this.html;
    }

    insertScript(script: string) {
        this.value.querySelector('head').insertAdjacentHTML('beforeend', `<script>${script}</script>`);
        this.changed = true;
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

    constructor(private html: string) {}

    private _value?: htmlparser.HTMLElement;

    private changed = false;

    private get value() {
        return this._value ??= htmlparser.parse(this.html);
    }
}
