/**
 * contexts/document_symbol.ts
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
import DocumentContext from './document';
import { lineNumToRange } from '../utils/misc';
import { FoldingRange, Optional } from '../utils/types';

/**
 * Context for symbols in a Texinfo document.
 */
export default class DocumentSymbolContext
{
    get documentSymbols() {
        return this._documentSymbols ??= this._calculcateDocumentSymbols();
    }

    clear() {
        this._documentSymbols = undefined;
    }

    constructor(private readonly _documentContext: DocumentContext) {}

    private _documentSymbols?: vscode.DocumentSymbol[];

    private readonly _document = this._documentContext.document;

    /**
     * Calculate document symbols based on folding ranges.
     */
    private _calculcateDocumentSymbols() {
        const ranges = Array<Optional<FoldingRange>>(this._document.lineCount);
        this._documentContext.foldingRange.foldingRanges
            .filter(range => range.kind === undefined)
            .forEach(range => ranges[range.start] = range);
        return foldingRangeToSymbols(ranges, 0, ranges.length);
    }
}

function foldingRangeToSymbols(
    ranges: readonly Optional<FoldingRange>[],
    start: number,
    end: number,
) {
    const symbols = <vscode.DocumentSymbol[]>[];
    for (let idx = start; idx < end; ++idx) {
        const node = ranges[idx];
        if (node === undefined) {
            continue;
        }
        const symbol = new vscode.DocumentSymbol(
            '@' + node.name,
            node.detail,
            vscode.SymbolKind.String,
            lineNumToRange(idx, node.end),  // full range
            lineNumToRange(idx),            // selection range
        );
        symbol.children = foldingRangeToSymbols(ranges, idx + 1, node.end);
        symbols.push(symbol);
        idx = node.end;
    }
    return symbols;
}
