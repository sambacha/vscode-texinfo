/**
 * preview.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as path from 'path';
import * as vscode from 'vscode';
import Converter from './converter';
import Document from './document';
import Options from './options';
import * as utils from './utils';

/**
 * Texinfo document preview.
 */
export default class Preview {

    /**
     * Create (if not yet created) and show preview for a Texinfo document.
     * 
     * @param editor The editor where the document is being held.
     */
    static async show(editor: vscode.TextEditor) {
        const document = editor.document;
        const documentContext = Document.get(document);
        if (documentContext === undefined) {
            return;
        }
        if (document.isUntitled) {
            if (!await utils.prompt('Save this document to display preview.', 'Save')) return;
            if (!await document.save()) return;
        }
        documentContext.initPreview().panel.reveal();
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

    constructor(private readonly documentContext: Document) {
        this.panel = vscode.window.createWebviewPanel('texinfo.preview', '', vscode.ViewColumn.Beside);
        this.disposables.push(this.panel.onDidDispose(() => this.close()));
        this.updateWebview();
    }

    private updateTitle() {
        const updating = this.updating ? '(Updating) ' : '';
        const fileName = path.basename(this.document.fileName);
        this.panel.title = `${updating}Preview ${fileName}`;
    }

    close() {
        this.disposables.forEach(event => event.dispose());
        this.panel.dispose();
        this.documentContext.closePreview();
    }

    async updateWebview() {
        if (this.updating) {
            this.pendingUpdate = true;
            return;
        }
        this.updating = true;
        this.pendingUpdate = false;
        this.updateTitle();

        let htmlCode = await Converter.convertToHtml(this.document.fileName);
        if (htmlCode === undefined) {
            prompt(`Failed to show preview for ${this.document.fileName}.`, 'Show log', true)
                .then(result => result && Logger.show());
        } else {
            if (Options.displayImage) {
                const pathName = path.dirname(this.document.fileName);
                // To display images in webviews, image URIs in HTML should be converted to VSCode-recognizable ones.
                htmlCode = utils.transformHtmlImageUri(htmlCode, src => {
                    const srcUri = vscode.Uri.file(pathName + '/' + src);
                    return this.panel.webview.asWebviewUri(srcUri).toString();
                });
            }
            this.panel.webview.html = htmlCode;
        }
        this.updating = false;
        this.updateTitle();

        this.pendingUpdate && this.updateWebview();
    }
}
