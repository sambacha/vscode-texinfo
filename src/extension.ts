/**
 * extension.ts - Texinfo extension entry
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';
import Options from './options';
import Preview from './preview';
import { CompletionItemProvider } from './completion';
import { FoldingRangeProvider, FoldingRangeContext } from './folding';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(Preview.update),
        vscode.workspace.onDidCloseTextDocument((document) => {
            Preview.close(document);
            FoldingRangeContext.close(document);
        }),
        vscode.workspace.onDidOpenTextDocument(FoldingRangeContext.open),
        vscode.workspace.onDidChangeTextDocument(FoldingRangeContext.update),
        vscode.commands.registerTextEditorCommand('texinfo.showPreview', Preview.show),
        vscode.languages.registerCompletionItemProvider('texinfo', new CompletionItemProvider(), '@'),
        vscode.languages.registerFoldingRangeProvider('texinfo', new FoldingRangeProvider()),
    );
}

export function deactivate() {
    Preview.destroyAll();
    Options.clear();
    FoldingRangeContext.clear();
}
