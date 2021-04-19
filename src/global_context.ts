/**
 * global_context.ts
 *
 * Copyright (C) 2021  CismonX <admin@cismon.net>
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
import CodeLensProvider from './providers/code_lens';
import CompletionItemProvider from './providers/completion_item';
import DocumentSymbolProvider from './providers/document_symbol';
import FoldingRangeProvider from './providers/folding_range';

/**
 * Manage extension-level global-scope contexts.
 */
export default class GlobalContext {

    readonly contextMapping = new ContextMapping(this);

    readonly diagnosis = new Diagnosis;

    readonly indicator = new Indicator(this);

    readonly logger = new Logger;

    /**
     * Note: `Options`' no singleton. Do not wire directly, always use `globalContext.options` instead.
     */
    get options() {
        return this._options ??= new Options;
    }

    subscribe(...items: vscode.Disposable[]) {
        this.context.subscriptions.push(...items);
    }

    constructor(private readonly context: vscode.ExtensionContext) {
        this.subscribe(this.contextMapping, this.diagnosis, this.indicator, this.logger,
            vscode.languages.registerCodeLensProvider('texinfo', new CodeLensProvider(this)),
            vscode.languages.registerCompletionItemProvider('texinfo', new CompletionItemProvider(this), '@'),
            vscode.languages.registerDocumentSymbolProvider('texinfo', new DocumentSymbolProvider(this)),
            vscode.languages.registerFoldingRangeProvider('texinfo', new FoldingRangeProvider(this)),
            vscode.workspace.onDidChangeConfiguration(this.refreshOptions),
        );
    }

    private _options?: Options;

    private refreshOptions() {
        this._options = undefined;
    }
}
