/**
 * symbol.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';
import Document from './document';
import { FoldingRange } from './folding';
import { Optional } from './utils';

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

    private foldingRanges?: FoldingRange[];

    get values() {
        return this.symbols ??= this.calculcateDocumentSymbols();
    }

    update(foldingRanges: FoldingRange[]) {
        this.foldingRanges = foldingRanges;
        this.symbols = undefined;
    }

    /**
     * Calculate (very limited) document symbols based on folding ranges.
     */
    private calculcateDocumentSymbols() {
        this.symbols = [];
        if (this.foldingRanges === undefined) {
            this.foldingRanges = this.documentContext.foldingRange.values;
        }
        const ranges = Array<RangeNode>(this.document.lineCount);
        this.foldingRanges.forEach(range => {
            if (range.kind !== undefined) return;
            ranges[range.start] = range;
        });
        return this.symbols = this.rangeToSymbols(ranges, 0, ranges.length);
    }

    private rangeToSymbols(ranges: RangeNode[], start: number, end: number) {
        const symbols = <vscode.DocumentSymbol[]>[];
        for (let idx = start; idx < end; ++idx) {
            const node = ranges[idx];
            if (node === undefined) continue;
            const startPosition = new vscode.Position(idx, 0);
            const endFirstLine = new vscode.Position(idx, Number.MAX_SAFE_INTEGER);
            const endLastLine = new vscode.Position(node.end, Number.MAX_SAFE_INTEGER);
            const range = new vscode.Range(startPosition, endLastLine);
            const selectionRange = new vscode.Range(startPosition, endFirstLine);
            const symbol = new vscode.DocumentSymbol('@' + node.name, node.detail,
                vscode.SymbolKind.String, range, selectionRange);
            symbol.children = this.rangeToSymbols(ranges, idx + 1, node.end);
            symbols.push(symbol);
            idx = node.end;
        }
        return symbols;
    }

    constructor(private readonly documentContext: Document) {}
}

type RangeNode = Optional<FoldingRange>;
