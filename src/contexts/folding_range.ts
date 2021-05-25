/**
 * contexts/folding_range.ts
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
import { lineNumToRange } from '../utils/misc';
import { FoldingRange, Range, NamedLine } from '../utils/types';
import DocumentContext from './document';

/**
 * Stores information about folding ranges for a document.
 * 
 * Actually, more than folding ranges (e.g. code lens) is handled within this context, so I believe
 * we should use another name...
 */
export default class FoldingRangeContext {

    /**
     * Get VSCode folding ranges from the context.
     */
    get foldingRanges() {
        return this._foldingRanges ?? this._calculateFoldingRanges();
    }

    /**
     * Get node values of document as VSCode code lenses.
     */
    get nodeValues() {
        this._foldingRanges ?? this._calculateFoldingRanges();
        return this._nodes;
    }

    /**
     * Update folding range context based on document change event.
     * 
     * @param events Events describing the changes in the document.
     */
    update(events: readonly vscode.TextDocumentContentChangeEvent[]) {
        this._contentMayChange = true;
        if (this._foldingRanges === undefined) return false;
        const eol = this._document.eol === vscode.EndOfLine.LF ? '\n' : '\r\n';
        for (const event of events) {
            // Clear cached folding range when line count changes.
            if (event.text.split(eol).length !== 1 || event.range.start.line !== event.range.end.line) {
                this._foldingRanges = undefined;
                this._nodes = [];
                return true;
            }
        }
        return false;
    }

    clear() {
        if (this._contentMayChange) {
            this._foldingRanges = undefined;
        }
    }

    constructor(private readonly _documentContext: DocumentContext) {}

    private readonly _document = this._documentContext.document;

    /**
     * Regex for matching subsection/section/chapter (-like) commands.
     */
    private static readonly _nodeFormat = RegExp('^@(?:(node)|(subsection|unnumberedsubsec|appendixsubsec|subheading)' +
        '|(section|unnumberedsec|appendixsec|heading)|(chapter|unnumbered|appendix|majorheading|chapheading)) (.*)$');

    private _foldingRanges?: FoldingRange[];

    private _nodes = <vscode.CodeLens[]>[];

    private _commentRange?: Range;
    private _headerStart?: number;
    private _closingChapter?: number;
    private _closingSection?: number;
    private _closingSubsection?: number;

    private _contentMayChange = true;

    private _addRange(start: number, end: number, extraArgs: {
        name?: string,
        detail?: string,
        kind?: vscode.FoldingRangeKind 
    }) {
        (this._foldingRanges ??= [])
            .push({ name: extraArgs.name ?? '', detail: extraArgs.detail ?? '', start, end, kind: extraArgs.kind });
    }

    /**
     * Calculate and update folding ranges for the document.
     * 
     * @param start Starting line number.
     * @param end Ending line number.
     */
    private _calculateFoldingRanges() {
        this._contentMayChange = false;
        this._foldingRanges = [];
        this._clearTemporaries();
        let closingBlocks = <NamedLine[]>[];
        let lastLine = this._document.lineCount - 1;
        let verbatim = false;
        for (let idx = lastLine; idx >= 0; --idx) {
            const line = this._document.lineAt(idx).text.trimLeft();
            if (!line.startsWith('@')) continue;
            if (!verbatim) {
                if (line === '@bye') {
                    lastLine = idx;
                    // Abort anything after `@bye`.
                    this._foldingRanges = [];
                    closingBlocks = [];
                    this._clearTemporaries();
                    continue;
                }
                if (this._processComment(line, idx)) continue;
            }
            // Process block.
            if (line.startsWith('@end ')) {
                if (verbatim) continue;
                const name = line.substring(5).trimRight();
                if (name === 'verbatim') {
                    verbatim = true;
                }
                closingBlocks.push({ name: name, line: idx });
                continue;
            }
            if (!verbatim && this._processNode(line, idx, lastLine)) continue;
            const closingBlock = closingBlocks.pop();
            if (closingBlock === undefined) continue;
            if (line.substring(1, closingBlock.name.length + 2).trim() === closingBlock.name) {
                this._addRange(idx, closingBlock.line, { name: closingBlock.name });
                // If `verbatim == true` goes here, this line must be the `@verbatim` line.
                verbatim = false;
            } else {
                closingBlocks.push(closingBlock);
            }
        }
        if (this._commentRange !== undefined) {
            this._addRange(this._commentRange.start, this._commentRange.end, { kind: vscode.FoldingRangeKind.Comment });
        }
        return this._foldingRanges;
    }

    private _clearTemporaries() {
        this._commentRange = undefined;
        this._headerStart = undefined;
        this._nodes = [];
        this._closingSubsection = this._closingSection = this._closingChapter = undefined;
    }

    private _getLastTextLine(lineNum: number, limit = 3) {
        for (let idx = lineNum; idx > lineNum - limit; --idx) {
            const line = this._document.lineAt(idx).text;
            if (line.startsWith('@node ')) return idx - 1;
            if (line === '') return idx; 
        }
        return lineNum;
    }

    private _processComment(lineText: string, lineNum: number) {
        if (!lineText.startsWith('@c')) return false;
        if (!lineText.startsWith(' ', 2) && !lineText.startsWith('omment ', 2)) {
            return false;
        }
        // Check for opening/closing header.
        if (lineText.startsWith('%**', lineText[2] === ' ' ? 3 : 9)) {
            if (this._headerStart === undefined) {
                this._headerStart = lineNum;
            } else {
                this._addRange(lineNum, this._headerStart, { kind: vscode.FoldingRangeKind.Region });
                this._headerStart = undefined;
            }
            return true;
        }
        if (this._commentRange === undefined) {
            this._commentRange = { start: lineNum, end: lineNum };
        } else if (this._commentRange.start - 1 === lineNum) {
            this._commentRange.start = lineNum;
        } else {
            this._addRange(this._commentRange.start, this._commentRange.end, { kind: vscode.FoldingRangeKind.Comment });
            this._commentRange = undefined;
        }
        return true;
    }

    private _processNode(lineText: string, lineNum: number, lastLineNum: number) {
        const result = lineText.match(FoldingRangeContext._nodeFormat);
        if (result === null) return false;
        // Node identifier.
        if (result[1] !== undefined) {
            this._nodes.push(new vscode.CodeLens(lineNumToRange(lineNum), {
                title: '$(go-to-file) Goto node in preview',
                command: 'texinfo.preview.goto',
                arguments: [this._document, result[5]],
            }));
            return true;
        }
        // Subsection level node.
        if (result[2] !== undefined) {
            this._addRange(lineNum, this._closingSubsection ?? lastLineNum, { name: result[2], detail: result[5] });
            this._closingSubsection = this._getLastTextLine(lineNum - 1);
            return true;
        }
        // Section level node.
        if (result[3] !== undefined) {
            this._addRange(lineNum, this._closingSection ?? lastLineNum, { name: result[3], detail: result[5] });
            this._closingSubsection = this._closingSection = this._getLastTextLine(lineNum - 1);
            return true;
        }
        // Chapter level node.
        if (result[4] !== undefined) {
            this._addRange(lineNum, this._closingChapter ?? lastLineNum, { name: result[4], detail: result[5] });
            this._closingSubsection = this._closingSection = this._closingChapter = this._getLastTextLine(lineNum - 1);
            return true;
        }
        return false;
    }
}
