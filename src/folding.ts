/**
 * folding.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';

/**
 * Provide folding range info for Texinfo source code.
 */
export class FoldingRangeProvider implements vscode.FoldingRangeProvider {

    provideFoldingRanges(document: vscode.TextDocument) {
        return FoldingRangeContext.get(document).foldingRanges;
    }
}

/**
 * Stores information about folding ranges for a document.
 */
export class FoldingRangeContext {

    private static readonly map = new Map<vscode.TextDocument, FoldingRangeContext>();

    /**
     * Initialize folding range context for a document.
     * 
     * @param document 
     */
    static open(document: vscode.TextDocument) {
        if (document.languageId === 'texinfo') {
            FoldingRangeContext.get(document);
        }
    }

    /**
     * Get existing folding range context of a document, or create one if not exist. 
     * 
     * @param document 
     */
    static get(document: vscode.TextDocument) {
        return FoldingRangeContext.map.get(document) ?? new FoldingRangeContext(document);
    }

    /**
     * Update the folding range context of a document based on its change event.
     * 
     * @param event Change event of a document.
     */
    static update(event: vscode.TextDocumentChangeEvent) {
        if (event.document.languageId !== 'texinfo') {
            return;
        }
        FoldingRangeContext.get(event.document).update(event.contentChanges);
    }

    /**
     * Destroy the folding range context of a document.
     * 
     * @param document 
     */
    static close(document: vscode.TextDocument) {
        FoldingRangeContext.map.delete(document);
    }

    /**
     * Destroy all existing folding range contexts.
     */
    static clear() {
        FoldingRangeContext.map.clear();
    }

    /**
     * Get VSCode folding ranges from the context.
     */
    get foldingRanges() {
        if (this.bufferedFoldingRanges === undefined) {
            this.calculateFoldingRanges();
        }
        return this.bufferedFoldingRanges;
    }

    private bufferedFoldingRanges?: vscode.FoldingRange[];

    private commentRange?: { start: number, end: number };

    private headerStart?: number;

    private constructor(private readonly document: vscode.TextDocument) {
        FoldingRangeContext.map.set(document, this);
    }

    /**
     * Calculate and update folding ranges for the document.
     * 
     * @param start Starting line number.
     * @param end Ending line number.
     */
    private calculateFoldingRanges() {
        this.headerStart = undefined;
        const closingBlocks = <{ name: string, line: number }[]>[];
        for (let idx = this.document.lineCount - 1; idx >= 0; --idx) {
            const line = this.document.lineAt(idx).text;
            if (!line.startsWith('@')) {
                continue;
            }
            if (this.processComment(line, idx)) {
                continue;
            }
            // Process block.
            if (line.startsWith('end ', 1)) {
                closingBlocks.push({ name: line.substring(5), line: idx });
            } else {
                const closingBlock = closingBlocks.pop();
                if (closingBlock === undefined) {
                    continue;
                }
                if (line.substring(1, closingBlock.name.length + 2).trim() === closingBlock.name) {
                    this.insertRange(idx, closingBlock.line);
                } else {
                    closingBlocks.push(closingBlock);
                }
            }
        }
        if (this.commentRange !== undefined) {
            this.insertRange(this.commentRange.start, this.commentRange.end, vscode.FoldingRangeKind.Comment);
        }
        this.commentRange = undefined;
    }

    private processComment(lineText: string, lineNum: number) {
        if (lineText.startsWith('c', 1)) {
            if (!lineText.startsWith(' ', 2) && !lineText.startsWith('omment ', 2)) {
                return false;
            }
            // Check for opening/closing header.
            if (lineText.startsWith('%**', lineText[2] === ' ' ? 3 : 9)) {
                if (this.headerStart === undefined) {
                    this.headerStart = lineNum;
                } else {
                    this.insertRange(lineNum, this.headerStart);
                    this.headerStart = undefined;
                }
                return true;
            }
            if (this.commentRange === undefined) {
                this.commentRange = { start: lineNum, end: lineNum };
            } else if (this.commentRange.start - 1 === lineNum) {
                this.commentRange.start = lineNum;
            } else {
                this.insertRange(this.commentRange.start, this.commentRange.end, vscode.FoldingRangeKind.Comment);
                this.commentRange = { start: lineNum, end: lineNum };
            }
            return true;
        }
        return false;
    }

    private insertRange(start: number, end: number, kind?: vscode.FoldingRangeKind) {
        if (this.bufferedFoldingRanges === undefined) {
            this.bufferedFoldingRanges = [];
        }
        this.bufferedFoldingRanges.push(new vscode.FoldingRange(start, end, kind));
    }

    /**
     * Update folding range context based on document change event.
     * 
     * @param events Events describing the changes in the document.
     */
    private update(events: readonly vscode.TextDocumentContentChangeEvent[]) {
        for (const event of events) {
            const range = event.range;
            const updatedLines = event.text.split(this.document.eol === vscode.EndOfLine.LF ? '\n' : '\r\n').length;
            // Clear range buffer when line number changes.
            if (updatedLines !== 1 || range.start.line !== range.end.line) {
                this.bufferedFoldingRanges = undefined;
            }
        }
    }
}
