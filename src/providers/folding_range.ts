/**
 * providers/folding_range.ts
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
 * Provide folding range info for Texinfo documents.
 */
export default class FoldingRangeProvider implements vscode.FoldingRangeProvider {

    provideFoldingRanges(document: vscode.TextDocument) {
        return this.globalContext.contextMapping.getDocumentContext(document).foldingRange.foldingRanges;
    }

    constructor(private readonly globalContext: GlobalContext) {}
}
