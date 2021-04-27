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
 * See the `contributes.configuration` entry in package.json for details.
 */
export default class Options {

    get enableSnippets() {
        return this.getBoolean('completion.enableSnippets');
    }

    get hideSnippetCommands() {
        return this.getBoolean('completion.hideSnippetCommands');
    }

    get enableCodeLens() {
        return this.getBoolean('enableCodeLens');
    }

    get makeinfo() {
        return this.getString('makeinfo');
    }

    get customCSS() {
        return this.getString('preview.customCSS');
    }

    get errorLimit() {
        return this.getNumber('preview.errorLimit');
    }

    get includePaths() {
        return this.getArray('preview.includePaths');
    }

    get maxSize() {
        return this.getNumber('preview.maxSize') * 1024 * 1024;
    }

    get noHeaders() {
        return this.getBoolean('preview.noHeaders');
    }

    get noNumberSections() {
        return this.getBoolean('preview.noNumberSections');
    }

    get noValidation() {
        return this.getBoolean('preview.noValidation');
    }

    get noWarnings() {
        return this.getBoolean('preview.noWarnings');
    }

    get variables() {
        return this.getArray('preview.variables');
    }

    private readonly configuration = vscode.workspace.getConfiguration('texinfo');

    private getArray(section: string): readonly string[] {
        return this.configuration.get(section, []);
    }

    private getBoolean(section: string) {
        return this.configuration.get(section, false);
    }

    private getNumber(section: string) {
        return this.configuration.get(section, 0);
    }

    private getString(section: string) {
        return this.configuration.get(section, '');
    }
}
