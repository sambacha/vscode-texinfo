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
import Options from './options';
import { exec } from './utils/misc';

/**
 * Shows whether GNU Texinfo is properly installed and configured.
 */
export default class Indicator implements vscode.Disposable {

    private static singleton?: Indicator;

    static async click() {
        await Indicator.instance.updateStatus();
        Indicator.instance.refresh(vscode.window.activeTextEditor);
    }

    static onTextEditorChange(editor?: vscode.TextEditor) {
        Indicator.instance.refresh(editor);
    }

    static get instance() {
        return this.singleton ??= new Indicator();
    }

    private statusBarItem: vscode.StatusBarItem;

    private refresh(editor?: vscode.TextEditor) {
        if (editor === undefined || editor.document.languageId != 'texinfo') {
            this.statusBarItem.hide();
        } else {
            this.statusBarItem.show();
        }
    }

    private async updateStatus() {
        const output = await exec(Options.makeinfo, ['--version'], Options.maxSize);
        const result = output.data?.match(/\(GNU texinfo\) (.*)\n/);
        let tooltip = '', icon: string, version = '';
        if (result && result[1]) {
            version = result[1];
            if (!isNaN(+version) && +version < 6.7) {
                icon = '$(warning)';
                tooltip = `GNU Texinfo (${Options.makeinfo}) is outdated (${version} < 6.7).`;
            } else {
                icon = '$(check)';
            }
        } else {
            icon = '$(close)';
            tooltip = `GNU Texinfo (${Options.makeinfo}) is not correctly installed or configured.`;
        }
        this.statusBarItem.text = `${icon} GNU Texinfo ${version}`;
        this.statusBarItem.tooltip = tooltip;
        this.statusBarItem.command = 'texinfo.indicator.click';
    }

    private constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.updateStatus().then(() => this.refresh(vscode.window.activeTextEditor));
    }

    dispose() {
        this.statusBarItem.dispose();
    }
}
