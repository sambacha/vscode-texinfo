/**
 * extension.ts - Texinfo extension entry
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';
import { Options } from './options';
import { Preview } from './preview';
import { CompletionItemProvider } from './completion';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(Preview.update),
        vscode.workspace.onDidCloseTextDocument(Preview.close),
        vscode.commands.registerTextEditorCommand('texinfo.showPreview', Preview.show),
        vscode.languages.registerCompletionItemProvider('texinfo', new CompletionItemProvider(), '@'),
    );
}

export function deactivate() {
    Preview.destroyAll();
    Options.clear();
}
