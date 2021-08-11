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

/**
 * Stores information of a Texinfo document preview.
 */
export default class PreviewContext
{
    close() {
        this._disposables.forEach(event => event.dispose());
        this._panel.dispose();
        this._documentContext.closePreview();
        // Only show diagnostic information when the preview is active.
        this._diagnosis.delete(this._document);
    }

    goto(nodeName: string) {
        const message = { command: 'goto', value: getNodeHtmlRef(nodeName) };
        this._webview.postMessage(message);
    }

    show() {
        this._panel.reveal();
    }

    async updateWebview() {
        if (this._updating) {
            this._pendingUpdate = true;
            return;
        }
        this._updating = true;
        this._pendingUpdate = false;
        // Inform the user that the preview is updating, when `makeinfo`
        // takes too long.
        setTimeout(() => this._updating && this._updateTitle(), 500);
        const converter = new Converter(
            this._document.fileName,
            this._globalContext.path + '/ext/html-preview.pm',
            this._globalContext.options,
            this._logger,
        );
        const { data, error } = await converter.toHTML(
            path => this._webview.asWebviewUri(path),
            this._script,
        );
        if (error) {
            this._logger.log(error);
            this._diagnosis.update(this._document, error);
        } else {
            this._diagnosis.delete(this._document);
        }
        if (data === undefined) {
            prompt(`Failed to show preview for ${this._document.fileName}.`,
                    'Show log', true)
                .then(result => result && this._logger.show());
        } else {
            this._webview.html = data;
        }
        this._updating = false;
        this._updateTitle();
        this._pendingUpdate && this.updateWebview();
    }

    constructor(private readonly _documentContext: DocumentContext) {
        const options = {
            enableFindWidget: true,
            retainContextWhenHidden: true,
            enableScripts: true,
        };
        this._panel = vscode.window.createWebviewPanel(
            'texinfo.preview', '',
            vscode.ViewColumn.Beside,
            options,
        );
        this._webview = this._panel.webview;
        this._disposables.push(this._panel.onDidDispose(() => this.close()));
        this._updateTitle();
        this.updateWebview();
    }

    private readonly _document = this._documentContext.document;
    private readonly _globalContext = this._documentContext.globalContext;
    private readonly _diagnosis = this._globalContext.diagnosis;
    private readonly _logger = this._globalContext.logger;

    private readonly _disposables = <vscode.Disposable[]>[];

    private readonly _panel: vscode.WebviewPanel;
    private readonly _webview: vscode.Webview;

    /**
     * Whether a preview update request is pending.
     */
    private _pendingUpdate = false;

    /**
     * Whether the preview is updating.
     */
    private _updating = false;

    /**
     * Generate script used for jumping to the corresponding location of
     * preview with code lens.
     */
    private get _script() {
        if (!this._globalContext.options.enableCodeLens) return undefined;
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

    private _updateTitle() {
        const updating = this._updating ? '(Updating) ' : '';
        const fileName = path.basename(this._document.fileName);
        this._panel.title = `${updating}Preview ${fileName}`;
    }
}
