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
        return FoldingRangeContext.get(document)?.foldingRanges;
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
            new FoldingRangeContext(document);
        }
    }

    /**
     * Get existing folding range context of a document. 
     * 
     * @param document 
     */
    static get(document: vscode.TextDocument) {
        return FoldingRangeContext.map.get(document);
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
        FoldingRangeContext.get(event.document)?.update(event.contentChanges);
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
        return this.ranges.values;
    }

    private readonly ranges = new FoldingRangeContainer();

    private commentRange?: [number, number];

    private headerStart?: number;

    private closingBlocks = <ClosingBlock[]>[];

    private constructor(private readonly document: vscode.TextDocument) {
        FoldingRangeContext.map.set(document, this);
        console.log(Date.now());
        this.updateFoldingRanges(0, this.document.lineCount - 1);
        console.log(Date.now());
    }

    /**
     * Calculate and update folding ranges for the document.
     * 
     * @param start Starting line number.
     * @param end Ending line number.
     */
    private updateFoldingRanges(start: number, end: number) {
        for (let idx = end; idx >= start; --idx) {
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
                this.ranges.insert(this.commentRange[0], this.commentRange[1]);
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
                    this.ranges.insert(lineNum, this.headerStart);
                    this.headerStart = undefined;
                }
                return true;
            }
            if (this.commentRange === undefined) {
                this.commentRange = [lineNum, lineNum];
            } else if (this.commentRange[0] - 1 === lineNum) {
                this.commentRange[0] = lineNum;
            } else {
                this.ranges.insert(this.commentRange[0], this.commentRange[1], vscode.FoldingRangeKind.Comment);
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
                this.ranges.insert(lineNum, closingBlock.line);
            } else {
                this.closingBlocks.push(closingBlock);
            }
        }
    }

    private update(events: readonly vscode.TextDocumentContentChangeEvent[]) {
        console.log(events);
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

/**
 * Container which stores multiple ranges.
 * 
 * Used for incremental calculation of VSCode folding ranges to prevent full rescan on edit,
 * which could be catastrophic when dealing with large documents.
 */
class FoldingRangeContainer {

    private nodes = <FoldingRangeNode[]>[];

    private bufferedValues?: vscode.FoldingRange[];

    /**
     * Insert a new range to the container. 
     * 
     * The new range **SHOULD NOT** overlap with existing ranges.
     * 
     * @param start Start of range.
     * @param end End of range
     * @param kind Type of VSCode folding range.
     */
    insert(start: number, end: number, kind?: vscode.FoldingRangeKind) {
        if (this.nodes.length < end) {
            this.nodes.push(...Array.from({ length: end - this.nodes.length + 1 }, () => new FoldingRangeNode()));
        }
        this.bufferedValues = undefined;
        this.nodes[start].end = end;
        this.nodes[start].kind = kind;
        this.nodes[end].start = start;
        this.nodes[end].kind = kind;
    }

    /**
     * Get VSCode folding ranges from the container.
     */
    get values() {
        if (this.bufferedValues !== undefined) {
            return this.bufferedValues;
        }
        const values = <vscode.FoldingRange[]>[];
        this.nodes.forEach((node, idx) => {
            if (node.end !== undefined) {
                values.push(new vscode.FoldingRange(idx, node.end, node.kind));
            }
        });
        return (this.bufferedValues = values);
    }
}

/**
 * Node of a folding range which represents a line in the document.
 */
class FoldingRangeNode {

    /**
     * Corresponding start node index.
     */
    start?: number;

    /**
     * Corresponding end node index.
     */
    end?: number;

    /**
     * Type of VSCode folding range.
     */
    kind?: vscode.FoldingRangeKind;
}
