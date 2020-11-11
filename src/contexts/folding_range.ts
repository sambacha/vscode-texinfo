/**
 * contexts/folding_range.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';
import { lineNumToRange } from '../utils/misc';
import { FoldingRange, Range, NamedLine } from '../utils/types';

/**
 * Stores information about folding ranges for a document.
 * 
 * Actually, more than folding ranges (e.g. code lens) is handled within this context, so I believe
 * we should use another name...
 */
export default class FoldingRangeContext {

    /**
     * Regex for matching subsection/section/chapter (-like) commands.
     */
    private static readonly nodeFormat = RegExp('^@(?:(node)|(subsection|unnumberedsubsec|appendixsubsec|subheading)|' +
        '(section|unnumberedsec|appendixsec|heading)|(chapter|unnumbered|appendix|majorheading|chapheading)) (.*)$');

    /**
     * Get VSCode folding ranges from the context.
     */
    get values() {
        return this.foldingRanges ?? this.calculateFoldingRanges();
    }

    /**
     * Get node values of document as VSCode code lenses.
     */
    get nodeValues() {
        this.foldingRanges ?? this.calculateFoldingRanges();
        return this.nodes;
    }

    private foldingRanges?: FoldingRange[];

    private nodes = <vscode.CodeLens[]>[];

    private commentRange?: Range;

    private headerStart?: number;

    private closingChapter?: number;

    private closingSection?: number;

    private closingSubsection?: number;

    /**
     * Update folding range context based on document change event.
     * 
     * @param events Events describing the changes in the document.
     */
    update(events: readonly vscode.TextDocumentContentChangeEvent[]) {
        if (this.foldingRanges === undefined) return false;
        for (const event of events) {
            const updatedLines = event.text.split(this.document.eol === vscode.EndOfLine.LF ? '\n' : '\r\n').length;
            // Clear cached folding range when line count changes.
            if (updatedLines !== 1 || event.range.start.line !== event.range.end.line) {
                this.foldingRanges = undefined;
                this.nodes = [];
                return true;
            }
        }
        return false;
    }

    /**
     * Calculate and update folding ranges for the document.
     * 
     * @param start Starting line number.
     * @param end Ending line number.
     */
    private calculateFoldingRanges() {
        this.foldingRanges = [];
        this.clearTemporaries();
        let closingBlocks = <NamedLine[]>[];
        let lastLine = this.document.lineCount - 1;
        let verbatim = false;
        for (let idx = lastLine; idx >= 0; --idx) {
            const line = this.document.lineAt(idx).text;
            if (!line.startsWith('@')) continue;
            if (!verbatim) {
                if (line === '@bye') {
                    lastLine = idx;
                    // Abort anything after `@bye`.
                    this.foldingRanges = [];
                    closingBlocks = [];
                    this.clearTemporaries();
                    continue;
                }
                if (this.processComment(line, idx)) continue;
            }
            // Process block.
            if (line.startsWith('@end ')) {
                if (verbatim) continue;
                const name = line.substring(5);
                name === 'verbatim' && (verbatim = true);
                closingBlocks.push({ name: name, line: idx });
                continue;
            }
            if (!verbatim && this.processNode(line, idx, lastLine)) continue;
            const closingBlock = closingBlocks.pop();
            if (closingBlock === undefined) continue;
            if (line.substring(1, closingBlock.name.length + 2).trim() === closingBlock.name) {
                this.addRange(idx, closingBlock.line, { name: closingBlock.name });
                // If `verbatim == true` goes here, this line must be the `@verbatim` line.
                verbatim = false;
            } else {
                closingBlocks.push(closingBlock);
            }
        }
        if (this.commentRange !== undefined) {
            this.addRange(this.commentRange.start, this.commentRange.end, { kind: vscode.FoldingRangeKind.Comment });
        }
        return this.foldingRanges;
    }

    private processComment(lineText: string, lineNum: number) {
        if (!lineText.startsWith('@c')) return false;
        if (!lineText.startsWith(' ', 2) && !lineText.startsWith('omment ', 2)) return false;
        // Check for opening/closing header.
        if (lineText.startsWith('%**', lineText[2] === ' ' ? 3 : 9)) {
            if (this.headerStart === undefined) {
                this.headerStart = lineNum;
            } else {
                this.addRange(lineNum, this.headerStart, { kind: vscode.FoldingRangeKind.Region });
                this.headerStart = undefined;
            }
            return true;
        }
        if (this.commentRange === undefined) {
            this.commentRange = { start: lineNum, end: lineNum };
        } else if (this.commentRange.start - 1 === lineNum) {
            this.commentRange.start = lineNum;
        } else {
            this.addRange(this.commentRange.start, this.commentRange.end, { kind: vscode.FoldingRangeKind.Comment });
            this.commentRange = undefined;
        }
        return true;
    }

    constructor(private readonly document: vscode.TextDocument) {}

    private processNode(lineText: string, lineNum: number, lastLineNum: number) {
        const result = lineText.match(FoldingRangeContext.nodeFormat);
        if (result === null) return false;
        // Node identifier.
        if (result[1] !== undefined) {
            this.nodes.push(new vscode.CodeLens(lineNumToRange(lineNum), {
                title: '$(search-goto-file) Goto node in preview',
                command: 'texinfo.preview.goto',
                arguments: [this.document, result[5]],
            }));
            return true;
        }
        // Subsection level node.
        if (result[2] !== undefined) {
            this.addRange(lineNum, this.closingSubsection ?? lastLineNum, { name: result[2], detail: result[5] });
            this.closingSubsection = this.getLastTextLine(lineNum - 1);
            return true;
        }
        // Section level node.
        if (result[3] !== undefined) {
            this.addRange(lineNum, this.closingSection ?? lastLineNum, { name: result[3], detail: result[5] });
            this.closingSubsection = this.closingSection = this.getLastTextLine(lineNum - 1);
            return true;
        }
        // Chapter level node.
        if (result[4] !== undefined) {
            this.addRange(lineNum, this.closingChapter ?? lastLineNum, { name: result[4], detail: result[5] });
            this.closingSubsection = this.closingSection = this.closingChapter = this.getLastTextLine(lineNum - 1);
            return true;
        }
        return false;
    }

    private getLastTextLine(lineNum: number, limit = 3) {
        for (let idx = lineNum; idx > lineNum - limit; --idx) {
            const line = this.document.lineAt(idx).text;
            if (line.startsWith('@node ')) return idx - 1;
            if (line === '') return idx; 
        }
        return lineNum;
    }

    private addRange(start: number, end: number, extraArgs: {
        name?: string,
        detail?: string,
        kind?: vscode.FoldingRangeKind 
    }) {
        (this.foldingRanges ??= [])
            .push({ name: extraArgs.name ?? '', detail: extraArgs.detail ?? '', start, end, kind: extraArgs.kind });
    }

    private clearTemporaries() {
        this.commentRange = undefined;
        this.headerStart = undefined;
        this.nodes = [];
        this.closingSubsection = this.closingSection = this.closingChapter = undefined;
    }
}
