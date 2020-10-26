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

export type NamedLine = { name: string, line: number };

export type ExecResult = { data?: string, error: string };

export type FoldingRange = vscode.FoldingRange & { name: string, detail: string };

export function isDefined<T>(value: Optional<T>): value is T {
    return value !== undefined;
}
