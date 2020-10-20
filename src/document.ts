/**
 * document.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';
import { FoldingRangeContext } from './folding';
import Preview from './preview';
import { DocumentSymbolContext } from './symbol';

/**
 * Manages context and events for a document.
 */
export default class Document {

    private static readonly map = new Map<vscode.TextDocument, Document>();

    static of(document: vscode.TextDocument) {
        let documentContext = Document.map.get(document);
        if (documentContext === undefined) {
            Document.map.set(document, documentContext = new Document(document));
        }
        return documentContext;
    }

    static get(document: vscode.TextDocument) {
        return document.languageId === 'texinfo' ? Document.of(document) : undefined;
    }

    static update(event: vscode.TextDocumentChangeEvent) {
        const documentContext = Document.get(event.document);
        if (documentContext?.foldingRange.update(event.contentChanges)) {
            documentContext.symbol.update(documentContext.foldingRange.values);
        }
    }

    static save(document: vscode.TextDocument) {
        const documentContext = Document.get(document);
        documentContext?.preview?.updateWebview();
    }

    static close(document: vscode.TextDocument) {
        Document.map.get(document)?.preview?.close();
        Document.map.delete(document);
    }

    static clear() {
        Document.map.forEach(document => document.preview?.close());
        Document.map.clear();
    }

    readonly foldingRange = new FoldingRangeContext(this.document);

    readonly symbol = new DocumentSymbolContext(this);

    private preview?: Preview;

    initPreview() {
        return this.preview ??= new Preview(this);
    }

    closePreview() {
        this.preview = undefined;
    }

    private constructor(readonly document: vscode.TextDocument) {}
}
