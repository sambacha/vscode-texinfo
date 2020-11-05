/**
 * providers/completion_item.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';
import Options from '../options';
import { CompletionItem } from '../utils/types';

/**
 * Provide code completion info for Texinfo documents.
 */
export default class CompletionItemProvider implements vscode.CompletionItemProvider {

    private completionItems?: CompletionItem[];

    /**
     * Full list of completion items.
     * 
     * Excerpted from the {@link https://www.gnu.org/software/texinfo/manual/texinfo GNU Texinfo manual},
     * which is licensed under the GNU Free Documentation License.
     */
    private get values() {
        const enableSnippets = Options.enableSnippets;
        const hideSnippetCommands = Options.hideSnippetCommands;
        return this.completionItems ??= [
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
            snippet('alias', 'alias', 'Defines a new command to be just like an existing one', 0,
                '@alias new=existing', 'alias ${1:new}=${2:existing}'),
            command('alias', 'Defines a new command to be just like an existing one', { snippet: true }),
            ...lineCommandEnum('allowcodebreaks', 'Control breaking at "-" and "_" in TeX', 'true', 'false'),
            ...braceCommand('anchor', 'Define current location for use as a cross-reference target', 1, 'name'),
            ...lineCommand('appendix', 'Begin an appendix', 'title'),
            ...lineCommand('appendixsec', 'Begin an appendix section within an appendix', 'title'),
            ...lineCommand('appendixsection', 'Begin an appendix section within an appendix', 'title'),
            ...lineCommand('appendixsubsec', 'Begin an appendix subsection', 'title'),
            ...lineCommand('appendixsubsubsec', 'Begin an appendix subsubsection', 'title'),
            command('arrow', 'Generate a right arrow glyph, "→"', { hasEmptyArguments: true }),
            command('asis', 'Print the table’s first column without highlighting'),
            ...lineCommand('author', 'Set the names of the author(s)', 'author-name'),
            ...braceCommand('b', 'Set text in a bold font', 1, 'text'),
            ...blockCommand('copying', 'Declare copying permissions'),
            command('bullet', 'Generate a large round dot, "•"', { hasEmptyArguments: true }),
            command('bye', 'Stop formatting'),
            ...lineCommand('c', 'Begin a line comment', 'comment'),
            snippet('header', 'c', 'Declare header block', 2, '@c %**start of header\n\n@c %**end of header',
                'c %**${1:start of header}\n$3\n@c %**${2:end of header}'),
            ...braceCommand('caption', 'Define the full caption for a @float', 1, 'definition'),
            ...blockCommand('cartouche', 'Highlight by drawing a box with rounded corners around it'),
            ...lineCommand('center', 'Center the line of text following the command', 'text-line'),
            ...lineCommand('centerchap', 'Like @chapter, but centers the chapter title', 'text-line'),
            ...lineCommand('chapheading', 'Print an unnumbered chapter-like heading', 'title'),
            ...lineCommand('chapter', 'Begin a numbered chapter', 'title'),
            ...lineCommand('cindex', 'Add entry to the index of concepts', 'entry'),
            ...braceCommand('cite', 'Highlight the name of a reference', 1, 'reference'),
            ...lineCommand('clear', 'Unset flag', 'flag'),
            command('click', 'Represent a single "click" in a GUI', { hasEmptyArguments: true }),
            ...braceCommand('clicksequence', 'Represent a sequence of clicks in a GUI', 1, 'actions'),
            ...lineCommand('clickstyle', 'Execute command on each @click', '@command'),
            ...braceCommand('code', 'Indicate text which is a piece of code', 0, 'sample-code'),
            ...lineCommandEnum('codequotebacktick', 'Control output of "`" in code examples', 'on', 'off'),
            ...lineCommandEnum('codequoteundirected', 'Control output of "\'" in code examples', 'on', 'off'),
            command('comma', 'Insert a comma character, ","', { hasEmptyArguments: true }),
            ...braceCommand('command', 'Indicate a command name', 1, 'command-name'),
            ...lineCommand('comment', 'Begin a line comment', 'comment'),
            command('contents', "Print a complete table of contents."),
            ...blockCommand('copying', 'Specify copyright holders and copying conditions'),
            command('copyright', 'The copyright symbol, "©"', { hasEmptyArguments: true }),
            ...lineCommand('defcodeindex', 'Define a new index, print entries in an @code font', 'index-name'),
            ...lineCommandX('defcv', 'Format a description for a variable associated with a class',
                'category', 'class', 'name'),
            ...lineCommandX('deffn', 'Format a description for a function', 'category', 'name', 'arguments'),
            ...lineCommand('defindex', 'Define a new index, print entries in a roman font', 'index-name'),
            ...lineCommand('definfoenclose', 'Create a new command for Info that marks text by enclosing it in ' +
                'strings that precede and follow the text.', 'newcmd', 'before', 'after'),
            ...lineCommandX('defivar', 'Format a description for an instance variable in object-oriented programming',
                'class', 'instance-variable-name'),
            ...lineCommandX('defmac', 'Format a description for a macro', 'macroname', 'arguments'),
            ...lineCommandX('defmethod', 'Format a description for a method in object-oriented programming',
                'class', 'method-name', 'arguments'),
            ...lineCommandX('defop', 'Format a description for an operation in object-oriented programming',
                'category', 'class', 'name', 'arguments'),
            ...lineCommandX('defopt', 'Format a description for a user option', 'option-name'),
            ...lineCommandX('defspec', 'Format a description for a special form', 'special-form-name', 'arguments'),
            ...lineCommandX('deftp', 'Format a description for a data type', 'category', 'name-of-type', 'attributes'),
            ...lineCommandX('deftypecv', 'Format a description for a typed class variable in ' +
                'object-oriented programming', 'category', 'class', 'data-type', 'name'),
            ...lineCommandX('deftypefn', 'Format a description for a function or similar entity that may ' +
                'take arguments and that is typed', 'category', 'data-type', 'name', 'arguments'),
            ...lineCommandEnum('deftypefnnewline', 'Specifies whether return types for @deftypefn and similar ' +
                'are printed on lines by themselves', 'on', 'off'),
            ...lineCommandX('deftypefun', 'Format a description for a function in a typed language',
                'data-type', 'function-name', 'arguments'),
            ...lineCommandX('deftypeivar', 'Format a description for a typed instance variable in ' +
                'object-oriented programming', 'class', 'data-type', 'variable-name'),
            ...lineCommandX('deftypemethod', 'Format a description for a typed method in object-oriented programming',
                'class', 'data-type', 'method-name', 'arguments'),
            ...lineCommandX('deftypeop', 'Format a description for a typed operation in object-oriented programming',
                'category', 'class', 'data-type', 'name', 'arguments'),
            ...lineCommandX('deftypevar', 'Format a description for a variable in a typed language',
                'data-type', 'variable-name'),
            ...lineCommandX('deftypevr', 'Format a description for something like a variable in a typed language',
                'category', 'data-type', 'name'),
            ...lineCommandX('defun', 'Format a description for a function', 'function-name', 'arguments'),
            ...lineCommandX('defvar', 'Format a description for a variable', 'variable-name'),
            ...lineCommandX('defvr', 'Format a description for any kind of variable', 'category', 'name'),
            command('detailmenu', 'Mark the (optional) detailed node listing in a master menu'),
            ...braceCommand('dfn', 'Indicate the introductory or defining use of a term', 1, 'term'),
            command('DH', 'Generate the uppercase Icelandic letter eth, "Ð", ð', { hasEmptyArguments: true }),
            command('dh', 'Generate the lower Icelandic letter eth, "ð"', { hasEmptyArguments: true }),
            ...lineCommand('dircategory', "Specify a part of the Info directory menu where this file's entry should go",
                'dirpart'),
            ...blockCommand('direntry', 'Begin the Info directory menu entry for this file'),
            ...blockCommand('display', 'Begin a kind of example'),
            ...braceCommand('dmn', 'Format a unit of measure, as in 12pt', 1, 'dimension'),
            ...blockCommand('docbook', 'Enter Docbook completely'),
            ...blockCommand('documentdescription', 'Set the document description text, included in the HTML output'),
            ...lineCommand('documentencoding', 'Declare the input encoding', 'enc'),
            ...lineCommand('documentlanguage', 'Declares the current document locale', 'll_CC'),
            ...braceCommand('dotaccent', 'Generate a dot accent over the character', 1, 'c'),
            ...braceCommandEnum('dotless', 'Generate dotless i, "ı", or dotless j, "ȷ"', 'i', 'j'),
            command('dots', 'Generate an ellipsis, "…"', { hasEmptyArguments: true }),
            ...braceCommand('email', 'Indicate an electronic mail address', 1, 'address', 'displayed-text'),
            ...braceCommand('emph', 'Emphasize text', 1, 'text'),
            ...lineCommand('end', 'Ends a block command environment', 'environment'),
            command('enddots', 'Generate an end-of-sentence ellipsis, "..."', { hasEmptyArguments: true }),
            ...blockCommand('enumerate', 'Begin a numbered list, using @item for each entry'),
            ...braceCommand('env', 'Indicate an environment variable name', 1, 'environment-variable'),
            command('equiv', 'Insert a glyph indicating exact equivalence, "≡"', { hasEmptyArguments: true }),
            command('error', 'Indicate that the following text is an error message, "error→"',
                { hasEmptyArguments: true }),
            ...braceCommand('errormsg', 'Report message as an error to standard error, and exit unsuccessfully',
                1, 'msg'),
            command('euro', 'Generate the Euro currency sign, "€"', { hasEmptyArguments: true }),

            ...blockCommand('example', 'Indicate an example'),
            ...lineCommand('exampleindent', 'Indent example-like environments by number of spaces', 'indent'),
            command('exclamdown', 'Generate an upside-down exclamation mark, "¡"', { hasEmptyArguments: true }),
            ...lineCommand('exdent', 'Remove any indentation a line might have', 'line-of-text'),
            command('expansion', 'Indicate the result of a macro expansion with a glyph, "→"',
                { hasEmptyArguments: true }),
            ...braceCommand('file', 'Highlight the name of a file', 1, 'filename'),
            command('finalout', 'Prevent TeX from printing large black warning rectangles beside over-wide lines'),
            ...lineCommand('findex', 'Add entry to the index of functions', 'entry'),
            ...lineCommandEnum('firstparagraphindent', 'Control indentation of the first paragraph after ' +
                'section headers', 'none', 'insert'),
            ...blockCommand('float', 'Environment to define floating material'),
            ...blockCommand('flushleft', 'Left justify every line while leaving the right end ragged'),
            ...blockCommand('flushright', 'Right justify every line while leaving the left end ragged'),
            ...lineCommandEnum('fonttextsize', 'Change the size of the main body font in the TeX output', '10', '11'),
            ...braceCommand('footnote', 'Enter a footnote', 1, 'footnote-text'),
            ...lineCommandEnum('footnotestyle', "Specify an Info file's footnote style", 'end', 'separate'),
            ...blockCommand('format', 'Begin a kind of example, but do not indent'),
            ...lineCommandEnum('frenchspacing', 'Control spacing after punctuation', 'on', 'off'),

            ...lineCommand('setfilename', 'Provide a name for the output files', 'info-file-name'),
            ...lineCommand('settitle', 'Specify the title for page headers', 'title'),
            command('insertcopying', 'Insert previously defined @copying text'),
            ...blockCommand('titlepage', 'Declare title page'),
        ].filter(completionItem => {
            if (!enableSnippets) return completionItem.kind === vscode.CompletionItemKind.Function;
            return !hideSnippetCommands || !completionItem.snippet;
        });
    }

    private oldOptions?: Options;

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext,
    ) {
        const lineText = document.lineAt(position.line).text;
        // Ignore comment line.
        if (lineText.startsWith('@c ') || lineText.startsWith('@comment ')) return undefined;
        // Triggered in the middle of a word.
        if (context.triggerKind === vscode.CompletionTriggerKind.Invoke) {
            const wordRange = document.getWordRangeAtPosition(position);
            if (wordRange === undefined) return undefined;
            // Normalize position so that it can be treated as triggered by '@' character.
            position = wordRange.start;
            if (document.getText(new vscode.Range(position.translate(0, -1), position)) !== '@') return undefined;
        }
        // Check whether options has changed.
        if (this.oldOptions !== Options.instance) {
            this.oldOptions = Options.instance;
            this.completionItems = undefined;
        }
        if (position.character === 1) return this.values;
        // Check whether the '@' character is escaped.
        if (document.getText(new vscode.Range(position.translate(0, -2), position.translate(0, -1))) === '@') {
            return undefined;
        } else {
            return this.values;
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
     * Whether this command has a snippet.
     */
    snippet?: boolean,
    /**
     * Whether this command takes no arguments and braces are required.
     */
    hasEmptyArguments?: boolean,
}): CompletionItem {
    return {
        label: '@' + name,
        kind: vscode.CompletionItemKind.Function,
        detail: detail,
        sortText: name + (extraArgs?.snippet ? '1' : ''),
        filterText: name,
        insertText: name + (extraArgs?.hasEmptyArguments ? '{}' : ''),
        snippet: extraArgs?.snippet,
    };
}

/**
 * Build the completion items for a block command.
 * 
 * @param name
 * @param detail
 */
function blockCommand(name: string, detail: string) {
    return [blockSnippet(name, detail), command(name, detail, { snippet: true })];
}

/**
 * Build the completion items for a brace command.
 * 
 * @param name
 * @param detail
 */
function braceCommand(name: string, detail: string, numArgsRequired: number, ...args: string[]) {
    return [braceCommandSnippet(name, detail, numArgsRequired, ...args), command(name, detail, { snippet: true })];
}

/**
 * Build the completion items for a brace command where the argument is an enum.
 * 
 * @param name 
 * @param detail 
 * @param items 
 */
function braceCommandEnum(name: string, detail: string, ...items: string[]) {
    return [
        snippet(name, name, detail, 0, `@${name}{${items.join('/')}}`, `${name}{\${1|${items.join(',')}|}}`),
        command(name, detail, { snippet: true }),
    ];
}

/**
 * Build the completion items for a line command with arguments.
 * 
 * @param name
 * @param detail
 * @param args
 */
function lineCommand(name: string, detail: string, ...args: string[]) {
    return [lineCommandSnippet(name, detail, ...args), command(name, detail, { snippet: true })];
}

/**
 * Build the completion items for a line command with arguments which has an x-form.
 * 
 * @param name
 * @param detail
 * @param args
 */
function lineCommandX(name: string, detail: string, ...args: string[]) {
    return [...lineCommand(name, detail, ...args), ...lineCommand(name + 'x', detail, ...args)];
}

/**
 * Build the completion items for a line command where the argument is an enum.
 * 
 * @param name
 * @param detail
 */
function lineCommandEnum(name: string, detail: string, ...items: string[]) {
    return [
        snippet(name, name, detail, 0, `@${name} ${items.join('/')}`, `${name} \${1|${items.join(',')}|}`),
        command(name, detail, { snippet: true }),
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
function braceCommandSnippet(name: string, detail: string, numArgsRequired: number, ...args: string[]) {
    const documentation = `@${name}{${args.map((arg, idx) => idx < numArgsRequired ? arg : '?' + arg).join(', ')}}`;
    const optionalArgs = args.splice(numArgsRequired).map((arg, idx) => `\${${numArgsRequired + idx + 2}:${arg}}`);
    const requiredArgs = args.map((arg, idx) => `\${${idx + 1}:${arg}}`);
    const optionalText = optionalArgs.length === 0 ? '' : `\${${numArgsRequired + 1}:, ${optionalArgs.join(', ')}}`;
    const insertText = `${name}{${requiredArgs.join(', ')}${optionalText}}`;
    return snippet(name, name, detail, 0, documentation, insertText);
}

/**
 * Build the completion item for a snippet of a brace command.
 * 
 * @param name The command name.
 * @param detail The command description.
 * @param args Argument names.
 */
function lineCommandSnippet(name: string, detail: string, ...args: string[]) {
    const argsIndexed = args.map((arg, idx) => `\${${idx + 1}:${arg}}`);
    return snippet(name, name, detail, 0, `@${name} ${args.join(' ')}`, `${name} ${argsIndexed.join(' ')}`);
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
): CompletionItem {
    return {
        label: label,
        kind: vscode.CompletionItemKind.Snippet,
        detail: detail,
        documentation: snippetDocumentation(documentation),
        sortText: keyword + sortOrder.toString(),
        filterText: keyword,
        insertText: new vscode.SnippetString(insertText),
    };
}

/**
 * Wraps Texinfo snippet code into a Markdown code block for documentation.
 * 
 * @param snippet The snippet code.
 */
function snippetDocumentation(snippet: string) {
    return new vscode.MarkdownString('```texinfo\n' + snippet + '\n```');
}
