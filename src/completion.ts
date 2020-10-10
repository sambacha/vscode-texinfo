/**
 * completion.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';

/**
 * Texinfo language completion item provider.
 */
export class CompletionItemProvider implements vscode.CompletionItemProvider {

    private readonly completionItems = [
        command('c', 'Line comment'),
        snippet('header', 'c', 'Declare header block', 1, '@c %**start of header\n\n@c %**end of header',
            'c %**${1:start of header}\n$2\n@c %**${3:end of header}'),
        command('setfilename', 'Set output file name'),
        command('settitle', 'Set document title'),
        command('copying', 'Declare copying permissions', { sortOrder: 1 }),
        blockSnippet('copying', 'Declare copying permissions'),
        command('copyright', 'The "©" symbol', { hasEmptyArguments: true }),
        command('insertcopying', 'Include permissions text'),
        command('titlepage', 'Declare title page', { sortOrder: 1 }),
        blockSnippet('titlepage', 'Declare title page'),
    ];

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext,
    ) {
        if (context.triggerKind === vscode.CompletionTriggerKind.Invoke) {
            const wordRange = document.getWordRangeAtPosition(position);
            if (wordRange === undefined) {
                return undefined;
            }
            position = wordRange.start;
            if (document.getText(new vscode.Range(position.translate(0, -1), position)) !== '@') {
                return undefined;
            }
        }
        if (position.character === 1) {
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

/**
 * Build the completion item for a Texinfo command.
 * 
 * @param name The command name.
 * @param detail The command description.
 * @param extraArgs Extra arguments.
 */
function command(name: string, detail: string, extraArgs?: {
    /**
     * Sort order for this completion item when names collide.
     */
    sortOrder?: number,
    /**
     * Whether this command takes no arguments and braces are required.
     */
    hasEmptyArguments?: boolean,
}): vscode.CompletionItem {
    return {
        label: '@' + name,
        kind: vscode.CompletionItemKind.Function,
        detail: detail,
        sortText: name + (extraArgs?.sortOrder?.toString() ?? ''),
        filterText: name,
        insertText: name + (extraArgs?.hasEmptyArguments ? '{}' : ''),
    };
}

function blockSnippet(name: string, detail: string): vscode.CompletionItem {
    return snippet(name, name, detail, 0, `@${name}\n\n@end ${name}`, `${name}\n$1\n@end ${name}`);
}

/**
 * Build the completion item for a generic snippet.
 * 
 * @param label The string showing up in the completion list.
 * @param keyword The word typed by the user.
 * @param detail The snippet description.
 * @param sortOrder Sort order for this completion item when names collide.
 * @param documentation The Markdown documentation for this snippet.
 * @param insertText The text to replace current word when the item is selected.
 */
function snippet(
    label: string,
    keyword: string,
    detail: string,
    sortOrder: number,
    documentation: string,
    insertText: string,
): vscode.CompletionItem {
    return {
        label: label,
        kind: vscode.CompletionItemKind.Snippet,
        detail: detail + ' (snippet)',
        documentation: snippetDocumentation(documentation),
        sortText: keyword + sortOrder.toString(),
        filterText: keyword,
        insertText: new vscode.SnippetString(insertText),
    };
}

/**
 * Wraps Texinfo snippet code into a Markdown code block for documentation.
 * 
 * @param snippet The snippet code
 */
function snippetDocumentation(snippet: string) {
    return new vscode.MarkdownString('```texinfo\n' + snippet + '\n```');
}
