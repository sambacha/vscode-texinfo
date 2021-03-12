/**
 * indicator.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';
import Options from './options';
import { exec } from './utils/misc';

export default class Indicator implements vscode.Disposable {

    private static singleton?: Indicator;

    private statusBarItem: vscode.StatusBarItem;

    static async click() {
        await Indicator.instance.updateStatus();
        Indicator.instance.refresh(vscode.window.activeTextEditor);
    }

    private refresh(editor?: vscode.TextEditor) {
        if (editor === undefined || editor.document.languageId != 'texinfo') {
            this.statusBarItem.hide();
        } else {
            this.statusBarItem.show();
        }
    }

    async updateStatus() {
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

    static onTextEditorChange(editor?: vscode.TextEditor) {
        Indicator.instance.refresh(editor);
    }

    static get instance() {
        return this.singleton ??= new Indicator();
    }

    private constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.updateStatus().then(() => this.refresh(vscode.window.activeTextEditor));
    }

    dispose() {
        this.statusBarItem.dispose();
    }
}
