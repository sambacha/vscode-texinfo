/**
 * folding.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import IntervalTree from '@flatten-js/interval-tree';
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
        FoldingRangeContext.get(event.document).update(event.contentChanges);
    }

    static close(document: vscode.TextDocument) {
        FoldingRangeContext.map.delete(document);
    }

    static clear() {
        FoldingRangeContext.map.clear();
    }

    get foldingRanges(): vscode.FoldingRange[] {
        return this.tempFoldingRanges ?? (this.tempFoldingRanges = this.intervalTree.values);
    }

    private intervalTree = new IntervalTree();

    private tempFoldingRanges?: vscode.FoldingRange[];

    private commentRange?: [number, number];

    private headerStart?: number;

    private closingBlocks = <ClosingBlock[]>[];

    private constructor(private readonly document: vscode.TextDocument) {
        FoldingRangeContext.map.set(document, this);
        console.log(Date.now());
        this.calculateFoldingRanges();
        console.log(Date.now());
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
            if (this.commentRange[1] - this.commentRange[0] > 1) {
                this.insertRange(this.commentRange);
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
                    this.insertRange([lineNum, this.headerStart]);
                    this.headerStart = undefined;
                }
            }
            if (this.commentRange === undefined) {
                this.commentRange = [lineNum, lineNum];
            } else if (this.commentRange[0] - 1 === lineNum) {
                this.commentRange[0] = lineNum;
            } else {
                this.insertRange(this.commentRange, vscode.FoldingRangeKind.Comment);
                this.commentRange = [lineNum, lineNum];
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
                this.insertRange([lineNum, closingBlock.line]);
            } else {
                this.closingBlocks.push(closingBlock);
            }
        }
    }

    private insertRange(range: [start: number, end: number], kind?: vscode.FoldingRangeKind) {
        const foldingRange = new vscode.FoldingRange(range[0], range[1], kind);
        this.intervalTree.insert(range, foldingRange);
    }

    private update(events: readonly vscode.TextDocumentContentChangeEvent[]) {
        console.log(events);
    }

    private clear() {
        this.intervalTree = new IntervalTree();
        this.tempFoldingRanges = undefined;
        this.commentRange = undefined;
        this.headerStart = undefined;
        this.closingBlocks = [];
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
