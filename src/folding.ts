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

export class FoldingRangeContext {

    private static readonly map = new Map<vscode.TextDocument, FoldingRangeContext>();

    static open(document: vscode.TextDocument) {
        if (document.languageId === 'texinfo') {
            new FoldingRangeContext(document);
        }
    }

    static get(document: vscode.TextDocument) {
        return FoldingRangeContext.map.get(document) ?? new FoldingRangeContext(document);
    }

    static update(event: vscode.TextDocumentChangeEvent) {
        if (event.document.languageId !== 'texinfo') {
            return;
        }
        FoldingRangeContext.get(event.document)?.update(event.contentChanges);
    }

    static close(document: vscode.TextDocument) {
        FoldingRangeContext.map.delete(document);
    }

    static clear() {
        FoldingRangeContext.map.clear();
    }

    foldingRanges = <vscode.FoldingRange[]>[];

    private commentRange?: vscode.FoldingRange;

    private headerStart?: number;

    private closingBlocks = <ClosingBlock[]>[];

    private constructor(private readonly document: vscode.TextDocument) {
        FoldingRangeContext.map.set(document, this);
        this.calculateFoldingRanges();
    }

    private calculateFoldingRanges() {
        for (let idx = this.document.lineCount - 1; idx >= 0; --idx) {
            const line = this.document.lineAt(idx);
            const lineText = line.text;
            const lineNum = line.lineNumber;
            if (!lineText.startsWith('@')) {
                continue;
            }
            if (this.processComment(lineText, lineNum)) {
                continue;
            }
            this.processBlock(lineText, lineNum);
        }
        if (this.commentRange !== undefined) {
            if (this.commentRange.end - this.commentRange.start > 1) {
                this.foldingRanges.push(this.commentRange);
            }
        }
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
                    this.foldingRanges.push(new vscode.FoldingRange(lineNum, this.headerStart));
                    this.headerStart = undefined;
                }
            }
            if (this.commentRange === undefined) {
                this.commentRange = new vscode.FoldingRange(lineNum, lineNum, vscode.FoldingRangeKind.Comment);
            } else if (this.commentRange.start - 1 === lineNum) {
                this.commentRange.start = lineNum;
            } else {
                this.foldingRanges.push(this.commentRange);
                this.commentRange = new vscode.FoldingRange(lineNum, lineNum, vscode.FoldingRangeKind.Comment);
            }
            return true;
        }
        return false;
    }

    private processBlock(lineText: string, lineNum: number) {
        if (lineText.startsWith('end ', 1)) {
            this.closingBlocks.push({ name: lineText.substring(5), line: lineNum });
        } else {
            const closingBlock = this.closingBlocks.pop();
            if (closingBlock === undefined) {
                return;
            }
            if (lineText.substring(1, closingBlock.name.length + 2).trim() === closingBlock.name) {
                this.foldingRanges.push(new vscode.FoldingRange(lineNum, closingBlock.line));
            } else {
                this.closingBlocks.push(closingBlock);
            }
        }
    }

    private update(events: readonly vscode.TextDocumentContentChangeEvent[]) {
        // console.log(events);
    }
}

/**
 * Represents a Texinfo block marked "closing" by `@end` command.
 */
interface ClosingBlock {

    /**
     * The name of the block.
     */
    name: string;

    /**
     * The terminating line number of the block.
     */
    line: number;
}
