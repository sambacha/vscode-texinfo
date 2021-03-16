/**
 * extension.ts
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
import ContextMapping from './context_mapping';
import Diagnosis from './diagnosis';
import Indicator from './indicator';
import Logger from './logger';
import Options from './options';
import PreviewContext from './contexts/preview';
import CodeLensProvider from './providers/code_lens';
import CompletionItemProvider from './providers/completion_item';
import DocumentSymbolProvider from './providers/document_symbol';
import FoldingRangeProvider from './providers/folding_range';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        ContextMapping.instance, Diagnosis.instance, Indicator.instance, Logger.instance, Options.instance,
        vscode.window.onDidChangeActiveTextEditor(Indicator.onTextEditorChange),
        vscode.workspace.onDidChangeTextDocument(ContextMapping.onDocumentUpdate),
        vscode.workspace.onDidSaveTextDocument(ContextMapping.onDocumentSave),
        vscode.workspace.onDidCloseTextDocument(ContextMapping.onDocumentClose),
        vscode.workspace.onDidChangeConfiguration(Options.clear),
        vscode.commands.registerTextEditorCommand('texinfo.preview.show', PreviewContext.showPreview),
        vscode.commands.registerCommand('texinfo.preview.goto', PreviewContext.gotoPreview),
        vscode.commands.registerCommand('texinfo.indicator.click', Indicator.click),
        vscode.languages.registerCodeLensProvider('texinfo', new CodeLensProvider()),
        vscode.languages.registerCompletionItemProvider('texinfo', new CompletionItemProvider(), '@'),
        vscode.languages.registerDocumentSymbolProvider('texinfo', new DocumentSymbolProvider()),
        vscode.languages.registerFoldingRangeProvider('texinfo', new FoldingRangeProvider()),
    );
}
