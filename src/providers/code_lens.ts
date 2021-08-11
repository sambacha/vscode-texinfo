/**
 * providers/code_lens.ts
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
import GlobalContext from '../global_context';

/**
 * Provide code lenses for Texinfo document.
 */
export default class CodeLensProvider implements vscode.CodeLensProvider
{
    provideCodeLenses(document: vscode.TextDocument) {
        if (!this._globalContext.options.enableCodeLens) {
            return undefined;
        }
        if (!this._globalContext.indicator.canDisplayPreview) {
            return undefined;
        }
        return this._globalContext.contextMapping
            .getDocumentContext(document).foldingRange.nodeValues;
    }

    constructor(private readonly _globalContext: GlobalContext) {}
}
