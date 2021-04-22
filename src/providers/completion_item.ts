/**
 * providers/completion_item.ts
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
import GlobalContext from '../global_context';
import { CompletionItem } from '../utils/types';

/**
 * Provide code completion info for Texinfo documents.
 */
export default class CompletionItemProvider implements vscode.CompletionItemProvider {

    /**
     * Full list of completion items.
     * 
     * Note: Descriptions of completion items for @-commands are excerpted from the
     * {@link https://www.gnu.org/software/texinfo/manual/texinfo GNU Texinfo manual},
     * which is licensed under the GNU Free Documentation License, version 1.3.
     * 
     * According to GFDL, this usage is considered "aggregation with independent work",
     * which means that GFDL applies to lines 46-365 of this file, while the remainder
     * is under GPL like other source code files of the project.
     */
    private get completionItems() {
        const enableSnippets = this.oldOptions.enableSnippets;
        const hideSnippetCommands = this.oldOptions.hideSnippetCommands;
        return this._completionItems ??= [
            command('ampchar', 'Insert an ampersand, "&"', { hasEmptyBrace: true }),
            command('atchar', 'Insert an at sign, "@"', { hasEmptyBrace: true }),
            command('backslashchar', 'Insert a blackslash, "\\"', { hasEmptyBrace: true }),
            command('lbracechar', 'Insert a left brace, "{"', { hasEmptyBrace: true }),
            command('rbracechar', 'Insert a right brace, "}"', { hasEmptyBrace: true }),
            ...braceCommand('abbr', 'Indicate a general abbreviation', 1, 'abbreviation', 'meaning'),
            ...braceCommand('acronym', 'Indicate an acronym in all capital letters', 1, 'acronym', 'meaning'),
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
            command('arrow', 'Generate a right arrow glyph, "→"', { hasEmptyBrace: true }),
            command('asis', 'Print the table’s first column without highlighting'),
            ...lineCommand('author', 'Set the names of the author(s)', 'author-name'),
            ...braceCommand('b', 'Set text in a bold font', 1, 'text'),
            ...blockCommand('copying', 'Declare copying permissions'),
            command('bullet', 'Generate a large round dot, "•"', { hasEmptyBrace: true }),
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
            command('click', 'Represent a single "click" in a GUI', { hasEmptyBrace: true }),
            ...braceCommand('clicksequence', 'Represent a sequence of clicks in a GUI', 1, 'actions'),
            ...lineCommand('clickstyle', 'Execute command on each @click', '@command'),
            ...braceCommand('code', 'Indicate text which is a piece of code', 1, 'sample-code'),
            ...lineCommandEnum('codequotebacktick', 'Control output of "`" in code examples', 'on', 'off'),
            ...lineCommandEnum('codequoteundirected', 'Control output of "\'" in code examples', 'on', 'off'),
            command('comma', 'Insert a comma character, ","', { hasEmptyBrace: true }),
            ...braceCommand('command', 'Indicate a command name', 1, 'command-name'),
            ...lineCommand('comment', 'Begin a line comment', 'comment'),
            command('contents', "Print a complete table of contents."),
            ...blockCommand('copying', 'Specify copyright holders and copying conditions'),
            command('copyright', 'The copyright symbol, "©"', { hasEmptyBrace: true }),
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
            ...blockCommand('detailmenu', 'Mark the (optional) detailed node listing in a master menu'),
            ...braceCommand('dfn', 'Indicate the introductory or defining use of a term', 1, 'term'),
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
            command('dots', 'Generate an ellipsis, "…"', { hasEmptyBrace: true }),
            ...braceCommand('email', 'Indicate an electronic mail address', 1, 'address', 'displayed-text'),
            ...braceCommand('emph', 'Emphasize text', 1, 'text'),
            ...lineCommand('end', 'Ends a block command environment', 'environment'),
            command('enddots', 'Generate an end-of-sentence ellipsis, "..."', { hasEmptyBrace: true }),
            ...blockCommand('enumerate', 'Begin a numbered list, using @item for each entry'),
            ...braceCommand('env', 'Indicate an environment variable name', 1, 'environment-variable'),
            command('equiv', 'Insert a glyph indicating exact equivalence, "≡"', { hasEmptyBrace: true }),
            command('error', 'Indicate that the following text is an error message, "error→"',
                { hasEmptyBrace: true }),
            ...braceCommand('errormsg', 'Report message as an error to standard error, and exit unsuccessfully',
                1, 'msg'),
            command('euro', 'Generate the Euro currency sign, "€"', { hasEmptyBrace: true }),
            ...headingFootingCommand('evenfooting', 'Generate page footers that are the same for even-numbered pages'),
            ...headingFootingCommand('evenheading', 'Generate page headers that are the same for even-numbered pages'),
            ...headingFootingCommand('everyfooting', 'Generate page footers that are the same for every pages'),
            ...headingFootingCommand('everyheading', 'Generate page headers that are the same for every pages'),
            ...blockCommand('example', 'Indicate an example'),
            ...lineCommand('exampleindent', 'Indent example-like environments by number of spaces', 'indent'),
            ...lineCommand('exdent', 'Remove any indentation a line might have', 'line-of-text'),
            command('expansion', 'Indicate the result of a macro expansion with a glyph, "→"',
                { hasEmptyBrace: true }),
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
            ...blockCommand('ftable', 'Begin a two-column table, using @item for each entry', 'formatting-command'),
            command('geq', 'Generate a greater-than-or-equal sign, "≥"', { hasEmptyBrace: true }),
            ...blockCommand('group', 'Disallow page breaks within following text'),
            command('hashchar', 'Insert a hash character, "#"', { hasEmptyBrace: true }),
            ...lineCommand('heading', 'Print an unnumbered section-like heading', 'title'),
            ...lineCommandEnum('headings', 'Turn page headings on or off, and/or specify single or double-sided ' + 
                'page headings for printing', 'on', 'single', 'double', 'singleafter', 'doubleafter', 'off'),
            command('headitem', 'Begin a heading row in a multitable'),
            ...braceCommand('headitemfont', 'Set text in the font used for multitable heading rows', 1, 'text'),
            ...blockCommand('html', 'Enter HTML completely'),
            ...braceCommand('hyphenation', 'Tell TeX how to hyphenate words', 1, 'hy-phen-a-ted words'),
            ...braceCommand('i', 'Set text in an italic font', 1, 'text'),
            ...blockCommand('ifclear', 'If the Texinfo variable is not set, format the following text', 'txivar'),
            ...blockCommand('ifcommanddefined', 'If the Texinfo code is defined, format the follow text', 'txicmd'),
            ...blockCommand('ifcommandnotdefined', 'If the Texinfo code is not defined, format the follow text',
                'txicmd'),
            ...blockCommand('ifdocbook', 'Begin text that will appear only in DocBook format'),
            ...blockCommand('ifhtml', 'Begin text that will appear only in HTML format'),
            ...blockCommand('ifinfo', 'Begin text that will appear only in Info format'),
            ...blockCommand('ifplaintext', 'Begin text that will appear only in plain text format'),
            ...blockCommand('iftex', 'Begin text that will appear only in TeX format'),
            ...blockCommand('ifxml', 'Begin text that will appear only in XML format'),
            ...blockCommand('ifnotdocbook', 'Begin text to be ignored in DocBook format'),
            ...blockCommand('ifnothtml', 'Begin text to be ignored in HTML format'),
            ...blockCommand('ifnotinfo', 'Begin text to be ignored in Info format'),
            ...blockCommand('ifnotplaintext', 'Begin text to be ignored in plain text format'),
            ...blockCommand('ifnottex', 'Begin text to be ignored in TeX format'),
            ...blockCommand('ifnotxml', 'Begin text to be ignored in XML format'),
            ...blockCommand('ignore', 'Begin text that will not appear in any output'),
            ...braceCommand('image', 'Insert an image', 1, 'filename', 'width', 'height', 'alt', 'ext'),
            ...lineCommand('include', 'Read the contents of Texinfo source file', 'filname'),
            command('indent', 'Insert paragraph indentation'),
            ...blockCommand('indentedblock', 'Indent a block of arbitary text on the left'),
            ...braceCommand('indicateurl', 'Indicate text that is a URL', 1, 'URL'),
            ...braceCommand('inforef', 'Make a cross-reference to an Info file', 3, 'node-name',
                'entry-name', 'info-file-name'),
            ...braceCommand('inlinefmt', 'Insert text only if the output format is fmt', 2, 'fmt', 'text'),
            ...braceCommand('inlinefmtifelse', 'Insert text if the output format is fmt, else else-text', 3,
                'fmt', 'text', 'else-text'),
            ...braceCommand('inlineifclear', 'Insert text only if variable var is not set', 2, 'var', 'text'),
            ...braceCommand('inlineifset', 'Insert text only if variable var is set', 2, 'var', 'text'),
            ...braceCommand('inlineraw', 'Insert text as in a raw conditional, only if the output format is fmt', 2,
                'fmt', 'raw-text'),
            command('insertcopying', 'Insert previously defined @copying text'),
            command('item', 'Indicate the beginning of a marked paragraph, or the beginning of the text of a ' +
                'first column entry for a table'),
            ...blockCommand('itemize', 'Begin an unordered list', 'mark-generating-character-or-command'),
            command('itemx', 'Like @item but do not generate extra vertical space above the item text'),
            ...braceCommand('kbd', 'Indicate characters of input to be typed by users', 1, 'keyboard-characters'),
            ...lineCommandEnum('kbdinputstyle', 'Specify when @kbd should use a font distinct from @code',
                'code', 'distinct', 'example'),
            ...braceCommand('key', 'Indicate the name of a key on a keyboard', 1, 'key-name'),
            ...lineCommand('kindex', 'Add entry to the index of keys', 'entry'),
            command('LaTeX', 'Generate the LaTeX logo', { hasEmptyBrace: true }),
            command('leq', 'Generate a less-than-or-equal sign, "≤"', { hasEmptyBrace: true }),
            ...blockCommand('lisp', 'Begin an example of Lisp code'),
            command('listoffloats', 'Produce a table-of-contents-like listing of floats'),
            command('lowersections', 'Change subsequent chapters to sections, sections to subsections'),
            ...blockCommand('macro', 'Define a new Texinfo command', 'macroname', 'params'),
            ...lineCommand('majorheading', 'Print an unnumbered chapter-like heading', 'title'),
            ...braceCommand('math', 'Format a mathematical expression', 1, 'math-expression'),
            ...blockCommand('menu', 'Mark the beginning of a menu of nodes'),
            command('minus', 'Generate a minus sign, "-"', { hasEmptyBrace: true }),
            ...blockCommand('multitable', 'Begin a multi-column table', 'column-width-spec'),
            ...lineCommand('need', 'Start a new page if fewer than n mils remain on the current page'),
            ...lineCommand('node', 'Begin a new node', 'name'),
            command('noindent', 'Prevent text from being indented as if it were a new paragraph'),
            command('novalidate', 'Suppress validation of node references'),
            ...headingFootingCommand('oddfooting', 'Generate page footers that are the same for odd-numbered pages'),
            ...headingFootingCommand('oddheading', 'Generate page headers that are the same for odd-numbered pages'),
            ...braceCommand('ogonek', 'Generate an ogonek diacritic under the character', 1, 'c'),
            ...braceCommand('option', 'Indicate a command-line option', 1, 'option-name'),
            command('page', 'Start a new page in a printed manual'),
            snippet('pagesizes', 'pagesizes', 'Change page dimensions', 0, '@pagesizes width, height',
                'pagesizes ${1:height}${2:, ${3:height}}'),
            command('pagesizes', 'Change page dimensions', { snippet: true }),
            ...lineCommand('paragraphindent', 'Indent paragraphs by spaces', 'indent'),
            ...lineCommand('part', 'Begin a group of chapters or appendixes', 'title'),
            ...lineCommand('pindex', 'Add entry to the index of programs', 'entry'),
            command('point', 'Indicate the position of point in a buffer with "∗"', { hasEmptyBrace: true }),
            command('pounds', 'Generate the pounds sterling currency sign, "£"', { hasEmptyBrace: true }),
            command('print', 'Indicate printed output to the reader with "-|"', { hasEmptyBrace: true }),
            ...lineCommand('printindex', 'Generate the alphabetized index for index name', 'index-name'),
            ...braceCommand('pxref', 'Make a reference that starts with a lowercase "see" in a printed manual', 1,
                'node', 'entry', 'node-title', 'info-file', 'manual'),
            ...blockCommand('quotation', 'Narrow the margins to indicate text that is quoted from another work'),
            command('quotedblleft', 'Produce quotation mark "“"', { hasEmptyBrace: true }),
            command('quotedblright', 'Produce quotation mark "”"', { hasEmptyBrace: true }),
            command('quoteleft', 'Produce quotation mark "‘"', { hasEmptyBrace: true }),
            command('quoteright', 'Produce quotation mark "’"', { hasEmptyBrace: true }),
            ...braceCommand('r', 'Set text in the regular roman font', 1, 'text'),
            command('raggedright', 'Fill text; left justify every line while leaving the right end ragged'),
            command('raisesections', 'Change subsequent sections to chapters, subsections to sections'),
            ...braceCommand('ref', 'Make a plain reference that does not start with any special text', 1,
                'node', 'entry', 'node-title', 'info-node', 'manual'),
            command('refill', 'Refill and indent the paragraph after all the other processing has been done'),
            command('registeredsymbol', 'Generate the legal symbol, "®"', { hasEmptyBrace: true }),
            command('result', 'Indicate the result of an expression with "⇒"', { hasEmptyBrace: true }),
            ...braceCommand('ringaccent', 'Generate a ring accent over the next character', 1, 'c'),
            ...braceCommand('samp', 'Indicate a literal example of a sequence of characters', 1, 'text'),
            ...braceCommand('sansserif', 'Set text in a sans serif font if possible', 1, 'text'),
            ...braceCommand('sc', 'Set text in a small caps font in printed output, and uppercase in Info', 1, 'text'),
            ...lineCommand('section', 'Begin a section within a chapter', 'title'),
            ...lineCommand('set', 'Define a Texinfo variable', 'txivar', 'value'),
            ...lineCommandEnum('setchapternewpage', 'Specify whether chapters start on new pages', 'on', 'off', 'odd'),
            ...lineCommand('setfilename', 'Provide a name for the output files', 'info-file-name'),
            ...lineCommand('settitle', 'Specify the title for page headers', 'title'),
            command('shortcaption', 'Define the short caption for a @float'),
            command('shortcontents', 'Print a short table of contents, with chapter-level entries only'),
            ...lineCommand('shorttitlepage', 'Generate a minimal title page', 'title'),
            ...braceCommand('slanted', 'Settextin aslantedfont if possible', 1, 'text'),
            command('smallbook', 'Cause TeX to produce a printed manual in a 7 by 9.25 inch format'),
            command('smalldisplay', 'Like @display, but use a smaller font size'),
            command('smallexample', 'Like @example, but use a smaller font size'),
            command('smallformat', 'Like @format, but use a smaller font size'),
            command('smallindentedblock', 'Like @indentedblock, but use a smaller font size'),
            ...blockCommand('smalllisp', 'Begin an example of Lisp code, same as @smallexample'),
            command('smallquotation', 'Like @quotation, but use a smaller font size'),
            ...braceCommand('sortas', 'Give a string by which the index entry should be sorted', 1, 'key'),
            ...lineCommand('sp', 'Skip n lines', 'n'),
            ...braceCommand('strong', 'Emphasize text by using boldface where possible', 1, 'text'),
            ...braceCommand('sub', 'Set text as a subscript', 1, 'text'),
            ...lineCommand('subheading', 'Print an unnumbered subsection-like heading', 'title'),
            ...lineCommand('subsection', 'Begin a subsection within a section', 'title'),
            ...lineCommand('subsubheading', 'Print an unnumbered subsubsection-like heading', 'title'),
            ...lineCommand('subsubsection', 'Begin a subsubsection within a subsection', 'title'),
            ...lineCommand('subtitle', 'Set a subtitle in a normal sized font flush to the right-hand side of the page',
                'title'),
            command('summarycontents', 'Print a short table of contents'),
            ...braceCommand('sup', 'Set text as a superscript', 1, 'text'),
            ...lineCommand('syncodeindex', 'Merge the first index into the second, formatting the entries from ' +
                'the first index with @code', 'from-index', 'to-index'),
            ...lineCommand('synindex', 'Merge the first index into the second', 'from-index', 'to-index'),
            ...braceCommand('t', 'Set text ina fixed-width font', 1, 'text'),
            command('tab', 'Separate columns in a row of a multitable'),
            ...blockCommand('table', 'Begin a two-column table', 'formatting-command'),
            command('TeX', 'Generate the TeX logo', { hasEmptyBrace: true }),
            ...blockCommand('tex', 'Enter TeX completely'),
            command('textdegree', 'Generate the degree symbol, "◦"', { hasEmptyBrace: true }),
            command('thischapter', 'Insert the number and name of the current chapter'),
            command('thischaptername', 'Insert the current chapter name'),
            command('thischapternum', 'Insert the current chapter number'),
            command('thisfile', 'Insert the current file name'),
            command('thispage', 'Insert the current page number'),
            command('thistitle', 'Insert the title of the current document'),
            command('tie', 'Generate a normal interword space at which a line break is not allowed',
                { hasEmptyBrace: true }),
            ...braceCommand('tieaccent', 'Generate a tie-after accent over the two characters', 1, 'cc'),
            ...lineCommand('tindex', 'Add entry to the index of data types', 'entry'),
            ...lineCommand('title', 'Set a title flush to the left-hand side of the page', 'title'),
            ...braceCommand('titlefont', 'Print text in a larger than normal font', 1, 'text'),
            ...blockCommand('titlepage', 'Begin the title page'),
            command('today', 'Insert the current date', { hasEmptyBrace: true }),
            ...lineCommand('top', 'Mark the topmost @node in the file', 'title'),
            ...braceCommand('U', 'Generate a representation of Unicode character', 1, 'hex'),
            ...braceCommand('u', 'Generate a breve accent over character', 1, 'c'),
            ...braceCommand('ubaraccent', 'Generate a underbar accent under character', 1, 'c'),
            ...braceCommand('udotaccent', 'Generate a underdot accent under character', 1, 'c'),
            ...lineCommand('unmacro', 'Undefine the macro if it has been defined', 'macroname'),
            ...lineCommand('unnumbered', 'Begin a chapter that appears without chapter numbers', 'title'),
            ...lineCommand('unnumberedsec', 'Begin a section that appears without section numbers', 'title'),
            ...lineCommand('unnumberedsubsec', 'Begin an unnumbered subsection', 'title'),
            ...lineCommand('unnumberedsubsubsec', 'Begin an unnumbered subsubsection', 'title'),
            ...braceCommand('uref', 'Define a cross-reference to an external URL', 1,
                'url', 'displayed-text', 'replacement'),
            ...braceCommand('url', 'Define a cross-reference to an external URL', 1,
                'url', 'displayed-text', 'replacement'),
            ...lineCommandEnum('urefbreakstyle', 'Specify how @uref/@url should break at special characters',
                'after', 'before', 'none'),
            ...braceCommand('v', 'Generate check accent over the character', 1, 'c'),
            ...lineCommandEnum('validatemenus', 'Control whether menus can be automatically generated', 'on', 'off'),
            ...braceCommand('value', 'Insert the value of the Texinfo variable', 1, 'txivar'),
            ...braceCommand('var', 'Highlight a metasyntactic variable', 1, 'metasyntactic-variable'),
            ...braceCommand('verb', 'Output text, delimited by the single character', 1, 'chartextchar'),
            ...blockCommand('verbatim', 'Output the text of the environment exactly as is'),
            ...lineCommand('verbatiminclude', 'Output the contents of file as is', 'filename'),
            ...lineCommand('vindex', 'Add entry to the index of variables', 'entry'),
            ...lineCommand('vskip', 'Insert whitespace so as to push text on the remainder of the page ' +
                'towards the bottom', 'amount'),
            ...lineCommand('vtable', 'Begin a two-column table', 'formatting-command'),
            ...braceCommand('w', 'Disallow line breaks within text', 1, 'text'),
            ...blockCommand('xml', 'Enter XML completely'),
            ...braceCommand('xref', 'Make a reference that starts with "See" in a printed manual', 1,
                'node', 'entry', 'node-title', 'info-file', 'manual'),
            ...lineCommandEnum('xrefautomaticsectiontitle', 'By default, use the section title instead of the ' +
                'node name in cross references', 'on', 'off'),
        ].filter(completionItem => {
            if (!enableSnippets) return completionItem.kind === vscode.CompletionItemKind.Function;
            return !hideSnippetCommands || !completionItem.snippet;
        });
    }

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
        const newOptions = this.globalContext.options;
        if (this.oldOptions !== newOptions) {
            this.oldOptions = newOptions;
            this._completionItems = undefined;
        }
        if (position.character === 1) return this.completionItems;
        // Check whether the '@' character is escaped.
        if (document.getText(new vscode.Range(position.translate(0, -2), position.translate(0, -1))) === '@') {
            return undefined;
        } else {
            return this.completionItems;
        }
    }

    constructor(private readonly globalContext: GlobalContext) {}

    private _completionItems?: CompletionItem[];

    private oldOptions = this.globalContext.options;
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
    hasEmptyBrace?: boolean,
}): CompletionItem {
    return {
        label: '@' + name,
        kind: vscode.CompletionItemKind.Function,
        detail: detail,
        sortText: name + (extraArgs?.snippet ? '1' : ''),
        filterText: name,
        insertText: name + (extraArgs?.hasEmptyBrace ? '{}' : ''),
        snippet: extraArgs?.snippet,
    };
}

/**
 * Build the completion items for a block command.
 * 
 * @param name
 * @param detail
 * @param args
 */
function blockCommand(name: string, detail: string, ...args: string[]) {
    return [blockSnippet(name, detail, ...args), command(name, detail, { snippet: true })];
}

/**
 * Build the completion items for a brace command.
 * 
 * @param name
 * @param detail
 * @param args
 */
function braceCommand(name: string, detail: string, numArgsRequired: number, ...args: string[]) {
    return [braceCommandSnippet(name, detail, numArgsRequired, ...args), command(name, detail, { snippet: true })];
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
 * Build the completion items for heading/footing commands.
 * 
 * @param name 
 * @param detail 
 */
function headingFootingCommand(name: string, detail: string) {
    return [
        snippet(name, name, detail, 0, `@${name} left @| center @| right`,
            name + ' ${1:left} @| ${2:center} @| ${3:right}'),
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
    const argsIndexed = args.map((arg, idx) => `\${${idx + 1}:${arg}}`).join(' ');
    return snippet(name, name, detail, 0, `@${name} ${args.join(' ')}`, `${name} ${argsIndexed}`);
}

/**
 * Build the completion item for a snippet of a block.
 * 
 * @param name The snippet name.
 * @param detail The snippet description.
 */
function blockSnippet(name: string, detail: string, ...args: string[]) {
    const argsIndexed = args.map((arg, idx) => `\${${idx + 1}:${arg}}`).join(' ');
    return snippet(name, name, detail, 0, `@${name} ${args.join(' ')}\n\n@end ${name}`,
        `${name}${args.length ? ' ' : ''}${argsIndexed}\n$${args.length + 1}\n@end ${name}`);
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
