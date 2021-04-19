/**
 * diagnosis.ts
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
import { lineNumToRange } from './utils/misc';
import { isDefined } from './utils/types';

/**
 * Manage diagnostic information of Texinfo documents.
 */
export default class Diagnosis implements vscode.Disposable {

    delete(document: vscode.TextDocument) {
        this.diagnostics.delete(document.uri);
    }

    /**
     * Generate diagnostic information based on error log from `makeinfo`.
     * 
     * @param document 
     * @param logText 
     */
    update(document: vscode.TextDocument, logText: string) {
        const fileName = document.uri.path;
        const diagnostics = logText.split('\n')
            .filter(line => line.startsWith(fileName))  
            .map(line => logLineToDiagnostic(line.substring(fileName.length + 1)))
            .filter(isDefined);
        this.diagnostics.set(document.uri, diagnostics);
    }

    dispose() {
        this.diagnostics.dispose();
    }

    private readonly diagnostics = vscode.languages.createDiagnosticCollection('texinfo');
}

function logLineToDiagnostic(lineText: string) {
    const lineNum = parseInt(lineText) - 1;
    // Ignore error that does not correspond a line.
    if (isNaN(lineNum)) return undefined;
    const message = lineText.substring(lineNum.toString().length + 2);
    const severity = message.startsWith('warning:') ? vscode.DiagnosticSeverity.Warning : undefined;
    return new vscode.Diagnostic(lineNumToRange(lineNum), message, severity);
}
