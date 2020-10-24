/**
 * diagnosis.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';
import { lineNumToRange } from './utils/misc';
import { isDefined } from './utils/types';

/**
 * Manage diagnostic information of Texinfo documents.
 */
export default class Diagnosis implements vscode.Disposable {

    private static singleton?: Diagnosis;

    static get instance() {
        return Diagnosis.singleton ??= new Diagnosis();
    }

    /**
     * Generate diagnostic information based on error log from `makeinfo`.
     * 
     * @param document 
     * @param logText 
     */
    static update(document: vscode.TextDocument, logText: string) {
        const fileName = document.uri.path;
        const diagnostics = logText.split('\n').filter(line => line.startsWith(fileName))
            .map(line => logLineToDiagnostic(line.substring(fileName.length + 1))).filter(isDefined);
        Diagnosis.instance.diagnostics.set(document.uri, diagnostics);
    }

    static delete(document: vscode.TextDocument) {
        Diagnosis.instance.diagnostics.delete(document.uri);
    }

    private readonly diagnostics = vscode.languages.createDiagnosticCollection('texinfo');

    dispose() {
        this.diagnostics.dispose();
        Diagnosis.singleton = undefined;
    }
}

function logLineToDiagnostic(lineText: string) {
    const lineNum = Number.parseInt(lineText) - 1;
    // Ignore error that does not correspond a line.
    if (Number.isNaN(lineNum)) return undefined;
    const message = lineText.substring(lineNum.toString().length + 2);
    const severity = message.startsWith('warning:') ? vscode.DiagnosticSeverity.Warning : undefined;
    return new vscode.Diagnostic(lineNumToRange(lineNum), message, severity);
}
