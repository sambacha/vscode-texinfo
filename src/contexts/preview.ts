/**
 * contexts/preview.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as path from 'path';
import * as vscode from 'vscode';
import DocumentContext from './document';
import ContextMapping from '../context_mapping';
import Diagnosis from '../diagnosis';
import Logger from '../logger';
import Options from '../options';
import Converter from '../utils/converter';
import { getNodeHtmlRef, prompt } from '../utils/misc';
import { Operator, Optional } from '../utils/types';

/**
 * Stores information of a Texinfo document preview.
 */
export default class PreviewContext {

    /**
     * Create (if not yet created) and show preview for a Texinfo document.
     * 
     * @param editor The editor where the document is being held.
     */
    static async showPreview(editor: vscode.TextEditor) {
        const document = editor.document;
        // Only show preview for saved files, as we're not gonna send document content to `makeinfo` via STDIN.
        // Instead, the file will be loaded from disk.
        if (document.isUntitled) {
            if (!await prompt('Save this document to display preview.', 'Save')) return;
            if (!await document.save()) return;
        }
        ContextMapping.getDocumentContext(document).initPreview().panel.reveal();
    }

    /**
     * Jump to the corresponding section of document preview by node name.
     * 
     * @param document 
     * @param nodeName 
     */
    static gotoPreview(document: vscode.TextDocument, nodeName: string) {
        ContextMapping.getDocumentContext(document).initPreview().panel.webview
            .postMessage({ command: 'goto', value: getNodeHtmlRef(nodeName) });
    }

    private readonly document = this.documentContext.document;

    private readonly panel: vscode.WebviewPanel;
    
    private readonly disposables = <vscode.Disposable[]>[];

    /**
     * Whether the preview is updating.
     */
    private updating = false;

    /**
     * Whether a preview update request is pending.
     */
    private pendingUpdate = false;

    private get imageTransformer(): Optional<Operator<string>> {
        if (!Options.displayImage) return undefined;
        const pathName = path.dirname(this.document.fileName);
        return src => {
            const srcUri = vscode.Uri.file(pathName + '/' + src);
            // To display images in webviews, image URIs in HTML should be converted to VSCode-recognizable ones.
            return this.panel.webview.asWebviewUri(srcUri).toString();
        };
    }

    private get script() {
        if (!Options.enableCodeLens) return undefined;
        return "window.addEventListener('message', event => {" +
            "const message = event.data;" +
            "switch (message.command) {" +
                "case 'goto':" +
                    "window.location.hash = message.value;" +
                    // We may want to scroll to the same node again.
                    "history.pushState('', '', window.location.pathname);" +
                    "break;" +
            "}" +
        "})";
    }

    close() {
        this.disposables.forEach(event => event.dispose());
        this.panel.dispose();
        this.documentContext.closePreview();
        // Only show diagnostic information when the preview is active.
        Diagnosis.delete(this.document);
    }

    async updateWebview() {
        if (this.updating) {
            this.pendingUpdate = true;
            return;
        }
        this.updating = true;
        this.pendingUpdate = false;
        // Inform the user that the preview is updating if `makeinfo` takes too long.
        setTimeout(() => this.updating && this.updateTitle(), 500);
        const { data, error } = await new Converter(this.document.fileName)
            .convertToHtml(this.imageTransformer, this.script);
        if (error) {
            Logger.log(error);
            Diagnosis.update(this.document, error);
        } else {
            Diagnosis.delete(this.document);
        }
        if (data === undefined) {
            prompt(`Failed to show preview for ${this.document.fileName}.`, 'Show log', true)
                .then(result => result && Logger.show());
        } else {
            this.panel.webview.html = data;
        }
        this.updating = false;
        this.updateTitle();
        this.pendingUpdate && this.updateWebview();
    }

    constructor(private readonly documentContext: DocumentContext) {
        this.panel = vscode.window.createWebviewPanel('texinfo.preview', '', vscode.ViewColumn.Beside,
            { enableFindWidget: true, retainContextWhenHidden: true, enableScripts: true });
        this.disposables.push(this.panel.onDidDispose(() => this.close()));
        this.updateTitle();
        this.updateWebview();
    }

    private updateTitle() {
        const updating = this.updating ? '(Updating) ' : '';
        const fileName = path.basename(this.document.fileName);
        this.panel.title = `${updating}Preview ${fileName}`;
    }
}
