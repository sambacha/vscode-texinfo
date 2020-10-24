/**
 * symbol.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';
import Document from './document';
import { FoldingRange } from './folding';
import { lineNumToRange, Optional } from './utils';

/**
 * Provide document symbol information for Texinfo documents.
 */
export class DocumentSymbolProvider implements vscode.DocumentSymbolProvider {

    provideDocumentSymbols(document: vscode.TextDocument) {
        return Document.of(document).symbol.values;
    }
}

/**
 * Context for symbols in a Texinfo document.
 */
export class DocumentSymbolContext {

    private document = this.documentContext.document;

    private symbols?: vscode.DocumentSymbol[];

    private foldingRanges?: readonly FoldingRange[];

    get values() {
        return this.symbols ??= this.calculcateDocumentSymbols();
    }

    clear() {
        this.foldingRanges = undefined;
        this.symbols = undefined;
    }

    /**
     * Calculate document symbols based on folding ranges.
     */
    private calculcateDocumentSymbols() {
        const ranges = Array<RangeNode>(this.document.lineCount);
        (this.foldingRanges ??= this.documentContext.foldingRange.values)
            .forEach(range => range.kind ?? (ranges[range.start] = range));
        return this.symbols = foldingRangeToSymbols(ranges, 0, ranges.length);
    }

    constructor(private readonly documentContext: Document) {}
}

type RangeNode = Optional<FoldingRange>;

function foldingRangeToSymbols(ranges: readonly RangeNode[], start: number, end: number) {
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
