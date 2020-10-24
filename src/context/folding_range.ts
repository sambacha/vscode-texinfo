/**
 * context/folding_range.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';
import { FoldingRange, Range } from '../utils/types';

/**
 * Stores information about folding ranges for a document.
 */
export default class FoldingRangeContext {

    /**
     * Get VSCode folding ranges from the context.
     */
    get values() {
        return this.foldingRanges ??= this.calculateFoldingRanges();
    }

    private foldingRanges?: FoldingRange[];

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
        this.headerStart = undefined;
        const closingBlocks = <{ name: string, line: number }[]>[];
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
                    this.commentRange = undefined;
                    this.headerStart = undefined;
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
            this.commentRange = undefined;
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
        if (lineText.startsWith('@subsection ')) {
            const detail = lineText.substring(12);
            this.addRange(lineNum, this.closingSubsection ?? lastLineNum, { name: 'subsection', detail: detail });
            this.closingSubsection = this.getLastTextLine(lineNum - 1);
            return true;
        } else if (lineText.startsWith('@section ')) {
            const detail = lineText.substring(9);
            this.addRange(lineNum, this.closingSection ?? lastLineNum, { name: 'section', detail: detail });
            this.closingSubsection = this.closingSection = this.getLastTextLine(lineNum - 1);
            return true;
        } else if (lineText.startsWith('@chapter ')) {
            const detail = lineText.substring(9);
            this.addRange(lineNum, this.closingChapter ?? lastLineNum, { name: 'chapter', detail: detail });
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
            .push(new FoldingRange(extraArgs.name ?? '', extraArgs.detail ?? '', start, end, extraArgs.kind));
    }
}
