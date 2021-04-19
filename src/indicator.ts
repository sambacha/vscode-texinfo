/**
 * indicator.ts
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
import GlobalContext from './global_context';
import { exec } from './utils/misc';

/**
 * Shows whether GNU Texinfo is properly installed and configured.
 */
export default class Indicator implements vscode.Disposable {

    get canDisplayPreview() {
        return this._canDisplayPreview;
    }

    dispose() {
        this.statusBarItem.dispose();
    }

    constructor(private readonly globalContext: GlobalContext) {
        globalContext.subscribe(
            vscode.commands.registerCommand('texinfo.indicator.click', this.click.bind(this)),
            vscode.window.onDidChangeActiveTextEditor(this.refresh.bind(this)),
        );
        this.updateStatus().then(() => this.refresh(vscode.window.activeTextEditor));
    }

    private _canDisplayPreview = false;

    private statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

    private async click() {
        await this.updateStatus();
        this.refresh(vscode.window.activeTextEditor);
    }

    private refresh(editor?: vscode.TextEditor) {
        if (editor?.document.languageId === 'texinfo') {
            this.statusBarItem.show();
        } else {
            this.statusBarItem.hide();
        }
    }

    private async updateStatus() {
        const options = this.globalContext.options;
        const output = await exec(options.makeinfo, ['--version'], options.maxSize);
        const result = output.data?.match(/\(GNU texinfo\) (.*)\n/);
        let tooltip = '', icon: string, version = '';
        if (result && result[1]) {
            version = result[1];
            if (!isNaN(+version) && +version < 6.7) {
                icon = '$(warning)';
                tooltip = `GNU Texinfo (${options.makeinfo}) is outdated (${version} < 6.7).`;
            } else {
                // Unrecognizable version. Assume it is okay.
                icon = '$(check)';
            }
            this._canDisplayPreview = true;
        } else {
            icon = '$(close)';
            tooltip = `GNU Texinfo (${options.makeinfo}) is not correctly installed or configured.`;
            this._canDisplayPreview = false;
        }
        this.statusBarItem.command = 'texinfo.indicator.click';
        this.statusBarItem.text = `${icon} GNU Texinfo ${version}`;
        this.statusBarItem.tooltip = tooltip;
    }
}
