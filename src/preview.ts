/**
 * preview.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as path from 'path';
import * as vscode from 'vscode';
import Converter from './converter';
import Options from './options';
import * as utils from './utils';

/**
 * Texinfo document preview.
 */
export default class Preview {

    private static readonly map = new Map<vscode.TextDocument, Preview>();

    /**
     * Create (if not yet created) and show preview for a Texinfo document.
     * 
     * @param editor The editor where the document is being held.
     */
    static async show(editor: vscode.TextEditor) {
        const document = editor.document;
        if (document.isUntitled) {
            if (!await utils.prompt('Save this document to display preview.', 'Save')) {
                return;
            }
            if (!await document.save()) {
                return;
            }
        }
        (Preview.map.get(document) ?? new Preview(document)).panel.reveal();
    }

    /**
     * If the document has a corresponding Texinfo preview, update the preview.
     * 
     * @param document
     */
    static update(document: vscode.TextDocument) {
        Preview.getByDocument(document)?.updateWebview();
    }

    /**
     * If the document has a corresponding Texinfo preview, close the preview.
     * 
     * @param document
     */
    static close(document: vscode.TextDocument) {
        Preview.getByDocument(document)?.destroy();
    }

    static clear() {
        Preview.map.forEach((preview) => preview.destroy());
    }
    
    /**
     * Get associated preview instance of the given document.
     * 
     * @param document
     */
    private static getByDocument(document: vscode.TextDocument) {
        return document.languageId !== 'texinfo' ? undefined : Preview.map.get(document);
    }

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

    private constructor(private readonly document: vscode.TextDocument) {
        this.panel = vscode.window.createWebviewPanel('texinfo.preview', '', vscode.ViewColumn.Beside);
        this.disposables.push(this.panel.onDidDispose(() => this.destroy()));
        Preview.map.set(document, this);
        this.updateWebview();
    }

    private updateTitle() {
        const updating = this.updating ? '(Updating) ' : '';
        const fileName = path.basename(this.document.fileName);
        this.panel.title = `${updating}Preview ${fileName}`;
    }

    private destroy() {
        this.disposables.forEach((event) => event.dispose());
        this.panel.dispose();
        Preview.map.delete(this.document);
    }

    private async updateWebview() {
        if (this.updating) {
            this.pendingUpdate = true;
            return;
        }
        this.updating = true;
        this.pendingUpdate = false;
        this.updateTitle();

        let htmlCode = await Converter.convertToHtml(this.document.fileName);
        if (htmlCode === undefined) {
            vscode.window.showErrorMessage(`Failed to show preview for ${this.document.fileName}.`);
        } else {
            if (Options.displayImage) {
                const pathName = path.dirname(this.document.fileName);
                // To display images in webviews, image URIs in HTML should be converted to VSCode-recognizable ones.
                htmlCode = utils.transformHtmlImageUri(htmlCode, (src) => {
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
