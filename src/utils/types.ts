/**
 * utils/types.ts
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

export type Optional<T> = T | undefined;

export type Operator<T> = (arg: T) => T;

export type Range = { start: number, end: number };

export type NamedLine = { name: string, line: number };

export type ExecResult = { data?: string, error: string };

export type FoldingRange = vscode.FoldingRange & { name: string, detail: string };

export type CompletionItem = vscode.CompletionItem & { snippet?: boolean };

export function isDefined<T>(value: Optional<T>): value is T {
    return value !== undefined;
}
