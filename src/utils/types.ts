/**
 * utils/types.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';

export type Optional<T> = T | undefined;

export type Operator<T> = (arg: T) => T;

export type Range = { start: number, end: number };

export type ExecResult = { data?: string, error: string };

export function isDefined<T>(value: Optional<T>): value is T {
    return value !== undefined;
}

/**
 * VSCode folding range with name and description.
 */
export class FoldingRange extends vscode.FoldingRange {

    constructor(
        readonly name: string,
        readonly detail: string,
        start: number,
        end: number,
        kind?: vscode.FoldingRangeKind,
    ) {
        super(start, end, kind);
    }
}
