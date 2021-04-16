/**
 * options.ts
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

/**
 * Fetch extension option values.
 * 
 * See `contributes.configuration` of package.json for details.
 */
export default class Options implements vscode.Disposable {

    private static singleton?: Options;

    static get instance() {
        return Options.singleton ??= new Options('texinfo');
    }

    static get makeinfo() {
        return Options.instance.getString('makeinfo');
    }

    static get enableCodeLens() {
        return Options.instance.getBoolean('enableCodeLens');
    }

    static get enableSnippets() {
        return Options.instance.getBoolean('completion.enableSnippets');
    }

    static get hideSnippetCommands() {
        return Options.instance.getBoolean('completion.hideSnippetCommands');
    }

    static get noHeaders() {
        return Options.instance.getBoolean('preview.noHeaders');
    }

    static get maxSize() {
        return Options.instance.getNumber('preview.maxSize') * 1024 * 1024;
    }

    static get errorLimit() {
        return Options.instance.getNumber('preview.errorLimit');
    }

    static get noValidation() {
        return Options.instance.getBoolean('preview.noValidation');
    }

    static get noWarnings() {
        return Options.instance.getBoolean('preview.noWarnings');
    }

    static get localImage() {
        return Options.instance.getBoolean('preview.localImage');
    }

    static get customCSS() {
        return Options.instance.getString('preview.customCSS');
    }

    static clear() {
        Options.singleton = undefined;
    }

    private readonly configuration: vscode.WorkspaceConfiguration;

    private getString(section: string) {
        return this.configuration.get(section, '');
    }

    private getBoolean(section: string) {
        return this.configuration.get(section, false);
    }

    private getNumber(section: string) {
        return this.configuration.get(section, 0);
    }

    private constructor(section: string) {
        this.configuration = vscode.workspace.getConfiguration(section);
    }

    dispose() {
        Options.singleton = undefined;
    }
}
