/**
 * document.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';
import DocumentContext from './contexts/document';

/**
 * Manage mappings between Texinfo documents and corresponding contexts.
 */
export default class ContextMapping implements vscode.Disposable {

    private static singleton?: ContextMapping;

    static get instance() {
        return ContextMapping.singleton ??= new ContextMapping();
    }

    static getDocumentContext(document: vscode.TextDocument) {
        let documentContext = ContextMapping.instance.value.get(document);
        if (documentContext === undefined) {
            ContextMapping.instance.value.set(document, documentContext = new DocumentContext(document));
        }
        return documentContext;
    }

    static onDocumentUpdate(event: vscode.TextDocumentChangeEvent) {
        const documentContext = ContextMapping.getDocumentContextIfExist(event.document);
        if (documentContext?.foldingRange.update(event.contentChanges)) {
            documentContext.documentSymbol.clear();
        }
    }

    static onDocumentSave(document: vscode.TextDocument) {
        const documentContext = ContextMapping.getDocumentContextIfExist(document);
        documentContext?.getPreview()?.updateWebview();
    }

    static onDocumentClose(document: vscode.TextDocument) {
        ContextMapping.instance.value.get(document)?.getPreview()?.close();
        ContextMapping.instance.value.delete(document);
    }

    private static getDocumentContextIfExist(document: vscode.TextDocument) {
        return document.languageId === 'texinfo' ? ContextMapping.getDocumentContext(document) : undefined;
    }

    private readonly value = new Map<vscode.TextDocument, DocumentContext>();

    dispose() {
        this.value.forEach(documentContext => documentContext.getPreview()?.close());
        ContextMapping.singleton = undefined;
    }
}
