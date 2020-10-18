/**
 * completion.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';

/**
 * Provide code completion info for Texinfo documents.
 */
export class CompletionItemProvider implements vscode.CompletionItemProvider {

    /**
     * Full list of completion items.
     * 
     * Excerpted from the {@link https://www.gnu.org/software/texinfo/manual/texinfo GNU Texinfo manual},
     * which is licensed under the GNU Free Documentation License.
     */
    private readonly completionItems = <vscode.CompletionItem[]> [
        command('ampchar', 'Insert an ampersand, "&"', { hasEmptyArguments: true }),
        command('atchar', 'Insert an at sign, "@"', { hasEmptyArguments: true }),
        command('backslashchar', 'Insert a blackslash, "\\"', { hasEmptyArguments: true }),
        command('lbracechar', 'Insert a left brace, "{"', { hasEmptyArguments: true }),
        command('rbracechar', 'Insert a right brace, "{"', { hasEmptyArguments: true }),
        command('AA', 'Generate the uppercase Scandinavian A-ring letter, "Å"', { hasEmptyArguments: true }),
        command('aa', 'Generate the lowercase Scandinavian A-ring letter, "å"', { hasEmptyArguments: true }),
        ...braceCommand('abbr', 'Indicate a general abbreviation', 1, 'abbreviation', 'meaning'),
        ...braceCommand('acronym', 'Indicate an acronym in all capital letters', 1, 'acronym', 'meaning'),
        command('AE', 'Generate the uppercase AE ligatures, "Æ"', { hasEmptyArguments: true }),
        command('ae', 'Generate the lowercase AE ligatures, "æ"', { hasEmptyArguments: true }),
        command('afivepaper', 'Change page dimensions for the A5 paper size'),
        command('afourlatex', 'Change page dimensions for the A4 paper size'),
        command('afourpaper', 'Change page dimensions for the A4 paper size'),
        command('afourwide', 'Change page dimensions for the A4 paper size'),
        snippet('alias', 'alias', 'Defines a new command to be just like an existing one', 0, '@alias new=existing',
            'alias ${1:new}=${2:existing}'),
        command('alias', 'Defines a new command to be just like an existing one', { sortOrder: 1 }),
        ...lineCommandEnum('allowcodebreaks', 'Control breaking at "-" and "_" in TeX', 'true', 'false'),
        ...braceCommand('anchor', 'Define current location for use as a cross-reference target', 1, 'name'),
        command('appendix', 'Begin an appendix'),
        command('appendixsec', 'Begin an appendix section within an appendix'),
        command('appendixsection', 'Begin an appendix section within an appendix'),
        command('appendixsubsec', 'Begin an appendix subsection'),
        command('appendixsubsubsec', 'Begin an appendix subsubsection'),
        command('arrow', 'Generate a right arrow glyph, "→"', { hasEmptyArguments: true }),
        command('asis', 'Print the table’s first column without highlighting'),
        command('author', 'Set the names of the author(s)'),
        ...braceCommand('b', 'Set text in a bold font', 1, 'text'),
        ...blockCommand('copying', 'Declare copying permissions'),
        command('bullet', 'Generate a large round dot, "•"', { hasEmptyArguments: true }),
        command('bye', 'stop formatting'),
        command('c', 'Begin a line comment'),
        snippet('header', 'c', 'Declare header block', 1, '@c %**start of header\n\n@c %**end of header',
            'c %**${1:start of header}\n$3\n@c %**${2:end of header}'),
        ...braceCommand('caption', 'Define the full caption for a @float', 1, 'definition'),
        ...blockCommand('cartouche', 'Highlight by drawing a box with rounded corners around it'),
        command('center', 'Center the line of text following the command'),
        command('centerchap', 'Like @chapter, but centers the chapter title'),
        command('chapheading', 'Print an unnumbered chapter-like heading, but omit from the table of contents'),
        command('chapter', 'Begin a numbered chapter'),
        command('cindex', 'Add entry to the index of concepts'),
        ...braceCommand('cite', 'Highlight the name of a reference', 1, 'reference'),
        command('clear', 'Unset flag'),
        command('click', 'Represent a single "click" in a GUI', { hasEmptyArguments: true }),
        ...braceCommand('clicksequence', 'Represent a sequence of clicks in a GUI', 1, 'actions'),
        command('clickstyle', 'Execute command on each @click'),
        ...braceCommand('code', 'Indicate text which is a piece of code', 0, 'sample-code'),
        ...lineCommandEnum('codequotebacktick', 'Control output of "`" in code examples', 'on', 'off'),
        ...lineCommandEnum('codequoteundirected', 'Control output of "\'" in code examples', 'on', 'off'),
        command('comma', 'Insert a comma character, ","', { hasEmptyArguments: true }),
        ...braceCommand('command', 'Indicate a command name', 1, 'command-name'),
        command('comment', 'Begin a line comment'),
        command('contents', "Print a complete table of contents."),
        ...blockCommand('copying', 'Specify copyright holders and copying conditions'),
        command('copyright', 'The copyright symbol, "©"', { hasEmptyArguments: true }),
        command('setfilename', 'Set output file name'),
        command('settitle', 'Set document title'),
        command('insertcopying', 'Include permissions text'),
        ...blockCommand('titlepage', 'Declare title page'),
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

/**
 * Build the completion items for a block command.
 * 
 * @param name The command name
 * @param detail The command description
 */
function blockCommand(name: string, detail: string) {
    return [blockSnippet(name, detail), command(name, detail, { sortOrder: 1 })];
}

/**
 * Build the completion items for a brace command.
 * 
 * @param name The command name
 * @param detail The command description
 */
function braceCommand(name: string, detail: string, numArgsRequired: number, ...args: string[]) {
    return [commandSnippet(name, detail, numArgsRequired, ...args), command(name, detail, { sortOrder: 1 })];
}

/**
 * Build the completion items for a line command where the argument is an enum.
 * 
 * @param name The command name
 * @param detail The command description
 */
function lineCommandEnum(name: string, detail: string, ...items: string[]) {
    return [
        snippet(name, name, detail, 0, `@${name} ${items.join('/')}`, `${name} \${1|${items.join(',')}|}`),
        command(name, detail, { sortOrder: 1}),
    ];
}

/**
 * Build the completion item for a snippet of a brace command.
 * 
 * @param name The command name.
 * @param detail The command description.
 * @param numArgsRequired Number of required arguments.
 * @param args Argument names.
 */
function commandSnippet(name: string, detail: string, numArgsRequired: number, ...args: string[]) {
    const documentation = `@${name}{${args.map((arg, idx) => idx < numArgsRequired ? arg : '?' + arg).join(', ')}}`;
    const optionalArgs = args.splice(numArgsRequired).map((arg, idx) => `\${${numArgsRequired + idx + 2}:${arg}}`);
    const requiredArgs = args.map((arg, idx) => `\${${idx + 1}:${arg}}`);
    const optionalText = optionalArgs.length === 0 ? '' : `\${${numArgsRequired + 1}:, ${optionalArgs.join(', ')}}`;
    const insertText = `${name}{${requiredArgs.join(', ')}${optionalText}}`;
    return snippet(name, name, detail, 0, documentation, insertText);
}

/**
 * Build the completion item for a snippet of a block.
 * 
 * @param name The snippet name.
 * @param detail The snippet description.
 */
function blockSnippet(name: string, detail: string) {
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
