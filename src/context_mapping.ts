/**
 * context_mapping.ts
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
        if (documentContext !== undefined) {
            documentContext.foldingRange.clear();
            documentContext.getPreview()?.updateWebview();
        }
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
