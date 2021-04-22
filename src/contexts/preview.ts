/**
 * contexts/preview.ts
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

import * as path from 'path';
import * as vscode from 'vscode';
import DocumentContext from './document';
import Converter from '../utils/converter';
import { getNodeHtmlRef, prompt } from '../utils/misc';
import { Operator, Optional } from '../utils/types';

/**
 * Stores information of a Texinfo document preview.
 */
export default class PreviewContext {

    close() {
        this.disposables.forEach(event => event.dispose());
        this.panel.dispose();
        this.documentContext.closePreview();
        // Only show diagnostic information when the preview is active.
        this.diagnosis.delete(this.document);
    }

    goto(nodeName: string) {
        this.panel.webview.postMessage({ command: 'goto', value: getNodeHtmlRef(nodeName) });
    }

    show() {
        this.panel.reveal();
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
        const { data, error } = await new Converter(this.document.fileName, this.globalContext.options, this.logger)
            .convertToHtml(this.imageTransformer, this.script);
        if (error) {
            this.logger.log(error);
            this.diagnosis.update(this.document, error);
        } else {
            this.diagnosis.delete(this.document);
        }
        if (data === undefined) {
            prompt(`Failed to show preview for ${this.document.fileName}.`, 'Show log', true)
                .then(result => result && this.logger.show());
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

    private readonly document = this.documentContext.document;
    private readonly globalContext = this.documentContext.globalContext;
    private readonly diagnosis = this.globalContext.diagnosis;
    private readonly logger = this.globalContext.logger;

    private readonly disposables = <vscode.Disposable[]>[];

    private readonly panel: vscode.WebviewPanel;

    /**
     * Whether a preview update request is pending.
     */
    private pendingUpdate = false;

    /**
     * Whether the preview is updating.
     */
    private updating = false;

    private get imageTransformer(): Optional<Operator<string>> {
        if (!this.globalContext.options.localImage) return undefined;
        const pathName = path.dirname(this.document.fileName);
        return src => {
            // Do not transform URIs of online images.
            if (src.startsWith('https://') || src.startsWith('http://')) return src;
            const srcUri = vscode.Uri.file(pathName + '/' + src);
            // To display images in webviews, image URIs in HTML should be converted to VSCode-recognizable ones.
            return this.panel.webview.asWebviewUri(srcUri).toString();
        };
    }

    /**
     * Generate script used for jumping to the corresponding location of preview with code lens.
     */
    private get script() {
        if (!this.globalContext.options.enableCodeLens) return undefined;
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

    private updateTitle() {
        const updating = this.updating ? '(Updating) ' : '';
        const fileName = path.basename(this.document.fileName);
        this.panel.title = `${updating}Preview ${fileName}`;
    }
}
