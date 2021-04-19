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
import GlobalContext from './global_context';
import { prompt } from './utils/misc';

/**
 * Manage mappings between Texinfo documents and corresponding document-specific contexts.
 */
export default class ContextMapping implements vscode.Disposable {

    getDocumentContext(document: vscode.TextDocument) {
        let documentContext = this.map.get(document);
        if (documentContext === undefined) {
            documentContext = new DocumentContext(this.globalContext, document);
            this.map.set(document, documentContext);
        }
        return documentContext;
    }

    dispose() {
        this.map.forEach(documentContext => documentContext.getPreview()?.close());
    }

    constructor(private readonly globalContext: GlobalContext) {
        globalContext.subscribe(
            vscode.commands.registerTextEditorCommand('texinfo.preview.show', this.showPreview.bind(this)),
            vscode.commands.registerCommand('texinfo.preview.goto', this.gotoPreview.bind(this)),
            vscode.workspace.onDidChangeTextDocument(this.onDocumentUpdate.bind(this)),
            vscode.workspace.onDidCloseTextDocument(this.onDocumentClose.bind(this)),
            vscode.workspace.onDidSaveTextDocument(this.onDocumentSave.bind(this)),
        );
    }

    private readonly map = new Map<vscode.TextDocument, DocumentContext>();

    private getDocumentContextIfExist(document: vscode.TextDocument) {
        return document.languageId === 'texinfo' ? this.getDocumentContext(document) : undefined;
    }

    /**
     * Jump to the corresponding section of document preview by node name.
     * 
     * @param document 
     * @param nodeName 
     */
    private gotoPreview(document: vscode.TextDocument, nodeName: string) {
        this.getDocumentContext(document).initPreview().goto(nodeName);
    }

    private onDocumentClose(document: vscode.TextDocument) {
        this.map.get(document)?.getPreview()?.close();
        this.map.delete(document);
    }

    private onDocumentSave(document: vscode.TextDocument) {
        const documentContext = this.getDocumentContextIfExist(document);
        if (documentContext === undefined) return;
        documentContext.foldingRange.clear();
        documentContext.getPreview()?.updateWebview();
    }

    private onDocumentUpdate(event: vscode.TextDocumentChangeEvent) {
        const documentContext = this.getDocumentContextIfExist(event.document);
        if (documentContext?.foldingRange.update(event.contentChanges)) {
            documentContext.documentSymbol.clear();
        }
    }

    /**
     * Create (if not yet created) and show preview for a Texinfo document.
     * 
     * @param editor The editor where the document is being held.
     */
    private async showPreview(editor: vscode.TextEditor) {
        const document = editor.document;
        // Only show preview for saved files, as we're not gonna send document content to `makeinfo` via STDIN.
        // Instead, the file will be loaded from disk.
        if (document.isUntitled) {
            if (!await prompt('Save this document to display preview.', 'Save')) return;
            if (!await document.save()) return;
        }
        this.getDocumentContext(document).initPreview().show();
    }
}
