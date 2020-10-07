/**
 * completion.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';

export class CompletionItemProvider implements vscode.CompletionItemProvider {

    private readonly completionItems: vscode.CompletionItem[] = [
        {
            label: 'header',
            kind: vscode.CompletionItemKind.Snippet,
            detail: 'Start/end of header',
            sortText: 'c1',
            filterText: 'c',
            insertText: 'c %**',
        },
        {
            label: '@setfilename',
            kind: vscode.CompletionItemKind.Function,
            detail: 'Set output file name',
            sortText: 'setfilename',
            filterText: 'setfilename',
            insertText: 'setfilename ',
        },
        {
            label: '@settitle',
            kind: vscode.CompletionItemKind.Function,
            detail: 'Set document title',
            sortText: 'settitle',
            filterText: 'settitle',
            insertText: 'settitle ',
        },
        {
            label: '@copying',
            kind: vscode.CompletionItemKind.Function,
            detail: 'declare copying permissions',
            sortText: 'copying1',
            filterText: 'copying',
            insertText: 'copying',
        },
        {
            label: 'copying',
            kind: vscode.CompletionItemKind.Snippet,
            detail: 'declare copying permissions',
            sortText: 'copying0',
            filterText: 'copying',
            insertText: new vscode.SnippetString('copying\n$1\n@end copying\n'),
        },
        {
            label: '@copyright',
            kind: vscode.CompletionItemKind.Function,
            detail: 'The \'©\' symbol',
            sortText: 'copyright',
            filterText: 'copyright',
            insertText: 'copyright{} '
        },
    ];

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ) {
        if (context.triggerKind === vscode.CompletionTriggerKind.Invoke) {
            const wordRange = document.getWordRangeAtPosition(position);
            if (wordRange === undefined) {
                return undefined;
            }
            position = wordRange.start;
            if (document.getText(new vscode.Range(position.translate(0, -1), position)) !== '@') {
                // Current word is not a command.
                return undefined;
            }
        }
        if (position.character === 1) {
            // Start of line.
            return this.completionItems;
        }
        if (document.getText(new vscode.Range(position.translate(0, -2), position.translate(0, -1))) === '@') {
            // The '@' character is escaped.
            return undefined;
        } else {
            return this.completionItems;
        }
    }
}
