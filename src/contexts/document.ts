/**
 * contexts/document.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';
import DocumentSymbolContext from './document_symbol';
import FoldingRangeContext from './folding_range';
import PreviewContext from './preview';

/**
 * Holds all contexts for a Texinfo document.
 */
export default class DocumentContext {

    readonly foldingRange = new FoldingRangeContext(this.document);

    readonly documentSymbol = new DocumentSymbolContext(this);

    private preview?: PreviewContext;

    initPreview() {
        return this.preview ??= new PreviewContext(this);
    }

    getPreview() {
        return this.preview;
    }

    closePreview() {
        this.preview = undefined;
    }

    constructor(readonly document: vscode.TextDocument) {}
}
