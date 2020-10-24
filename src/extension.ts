/**
 * extension.ts - extension entry
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';
import Diagnosis from './diagnosis';
import Document from './document';
import Logger from './logger';
import Options from './options';
import Preview from './preview';
import { CompletionItemProvider } from './completion';
import { FoldingRangeProvider } from './folding';
import { DocumentSymbolProvider } from './symbol';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(Document.of),
        vscode.workspace.onDidChangeTextDocument(Document.update),
        vscode.workspace.onDidSaveTextDocument(Document.save),
        vscode.workspace.onDidCloseTextDocument(Document.close),
        vscode.workspace.onDidChangeConfiguration(Options.clear),
        vscode.commands.registerTextEditorCommand('texinfo.showPreview', Preview.show),
        vscode.languages.registerCompletionItemProvider('texinfo', new CompletionItemProvider(), '@'),
        vscode.languages.registerFoldingRangeProvider('texinfo', new FoldingRangeProvider()),
        vscode.languages.registerDocumentSymbolProvider('texinfo', new DocumentSymbolProvider()),
        Diagnosis.instance,
    );
}

export function deactivate() {
    Document.clear();
    Logger.destroy();
    Options.clear();
}
