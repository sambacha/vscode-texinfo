/**
 * contexts/document.ts
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
import GlobalContext from '../global_context';
import DocumentSymbolContext from './document_symbol';
import FoldingRangeContext from './folding_range';
import PreviewContext from './preview';

/**
 * Holds all contexts for a Texinfo document.
 */
export default class DocumentContext
{
    readonly foldingRange = new FoldingRangeContext(this);

    readonly documentSymbol = new DocumentSymbolContext(this);

    initPreview() {
        return this._preview ??= new PreviewContext(this);
    }

    getPreview() {
        return this._preview;
    }

    closePreview() {
        this._preview = undefined;
    }

    constructor(
        readonly globalContext: GlobalContext,
        readonly document: vscode.TextDocument,
    ) {}

    private _preview?: PreviewContext;
}
