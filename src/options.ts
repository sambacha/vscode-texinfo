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
        return this._getBoolean('completion.enableSnippets');
    }

    get hideSnippetCommands() {
        return this._getBoolean('completion.hideSnippetCommands');
    }

    get noWarnings() {
        return this._getBoolean('diagnosis.noWarnings');
    }

    get enableCodeLens() {
        return this._getBoolean('enableCodeLens');
    }

    get makeinfo() {
        return this._getString('makeinfo');
    }

    get customCSS() {
        return this._getString('preview.customCSS');
    }

    get errorLimit() {
        return this._getNumber('preview.errorLimit');
    }

    get includePaths() {
        return this._getArray('preview.includePaths');
    }

    get maxSize() {
        return this._getNumber('preview.maxSize') * 1024 * 1024;
    }

    get noHeaders() {
        return this._getBoolean('preview.noHeaders');
    }

    get noNumberSections() {
        return this._getBoolean('preview.noNumberSections');
    }

    get noValidation() {
        return this._getBoolean('preview.noValidation');
    }

    get variables() {
        return this._getArray('preview.variables');
    }

    private readonly _configuration
        = vscode.workspace.getConfiguration('texinfo');

    private _getArray(section: string): readonly string[] {
        return this._configuration.get(section, []);
    }

    private _getBoolean(section: string) {
        return this._configuration.get(section, false);
    }

    private _getNumber(section: string) {
        return this._configuration.get(section, 0);
    }

    private _getString(section: string) {
        return this._configuration.get(section, '');
    }
}
