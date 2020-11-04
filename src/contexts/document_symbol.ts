/**
 * contexts/document_symbol.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';
import DocumentContext from './document';
import { lineNumToRange } from '../utils/misc';
import { FoldingRange, Optional } from '../utils/types';

/**
 * Context for symbols in a Texinfo document.
 */
export default class DocumentSymbolContext {

    private document = this.documentContext.document;

    private documentSymbols?: vscode.DocumentSymbol[];

    get values() {
        return this.documentSymbols ??= this.calculcateDocumentSymbols();
    }

    clear() {
        this.documentSymbols = undefined;
    }

    constructor(private readonly documentContext: DocumentContext) {}

    /**
     * Calculate document symbols based on folding ranges.
     */
    private calculcateDocumentSymbols() {
        const ranges = Array<Optional<FoldingRange>>(this.document.lineCount);
        this.documentContext.foldingRange.values.forEach(range => range.kind ?? (ranges[range.start] = range));
        return foldingRangeToSymbols(ranges, 0, ranges.length);
    }
}

function foldingRangeToSymbols(ranges: readonly Optional<FoldingRange>[], start: number, end: number) {
    const symbols = <vscode.DocumentSymbol[]>[];
    for (let idx = start; idx < end; ++idx) {
        const node = ranges[idx];
        if (node === undefined) continue;
        const range = lineNumToRange(idx, node.end);
        const selectionRange = lineNumToRange(idx);
        const symbol = new vscode.DocumentSymbol('@' + node.name, node.detail,
            vscode.SymbolKind.String, range, selectionRange);
        symbol.children = foldingRangeToSymbols(ranges, idx + 1, node.end);
        symbols.push(symbol);
        idx = node.end;
    }
    return symbols;
}
