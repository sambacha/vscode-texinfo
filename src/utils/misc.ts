/**
 * utils/misc.ts
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

import * as child_process from 'child_process';
import * as vscode from 'vscode';
import { ExecResult } from './types';

/**
 * Execute command and fetch output.
 * 
 * @param path Path to the executable file.
 * @param args Arguments to be passed to the command.
 * @param maxBuffer Max output buffer size.
 * @returns The output data, or `undefined` if execution fails.
 */
export function exec(path: string, args: string[], maxBuffer: number) {
    return new Promise<ExecResult>(
        resolve => child_process.execFile(path, args,
            {
                env: { ...process.env, LC_MESSAGES: 'en_US' },
                maxBuffer: maxBuffer,
            },
            (error, stdout, stderr) => resolve(error
                ? { error: stderr ? stderr : error.message }
                : { data: stdout, error: stderr }
            )
        )
    );
}

/**
 * Open a prompt with a button, and wait for user action.
 * 
 * @param message The message to be displayed on the prompt.
 * @param label Text to be displayed on the button.
 * @param error Whether the prompt is shown as an error message. Default false.
 * @returns Whether the user clicked the button.
 */
export async function prompt(message: string, label: string, error = false) {
    const func = error ?
        vscode.window.showErrorMessage : vscode.window.showInformationMessage;
    return label === await func(message, label);
}

/**
 * Convert line numbers to VSCode range.
 * 
 * @param startLine 
 * @param endLine Default to `startLine`.
 */
export function lineNumToRange(startLine: number, endLine = startLine) {
    const startPosition = new vscode.Position(startLine, 0);
    const endPosition = new vscode.Position(endLine, Number.MAX_SAFE_INTEGER);
    return new vscode.Range(startPosition, endPosition);
}

/**
 * Check whether character is an alphabet.
 * 
 * @param charCode ASCII code of character.
 */
export function isAlpha(charCode: number) {
    return (charCode >= 97 && charCode <= 122)
        || (charCode >= 65 && charCode <= 90);
}

/**
 * Check whether character is alphanumeric.
 * 
 * @param charCode ASCII code of character.
 */
export function isAlnum(charCode: number) {
    return isAlpha(charCode) || (charCode >= 48 && charCode <= 57);
}

/**
 * Get corresponding HTML cross-reference name by node name.
 * 
 * See section *HTML Cross-reference Node Name Expansion* in
 * the Texinfo manual.
 * 
 * TODO: Node name is not displayed verbatim, leading to wrong HTML xref when
 * containing commands. Fix this when migrating to LSP.
 * 
 * @param nodeName 
 */
export function getNodeHtmlRef(nodeName: string) {
    const result = nodeName.trim().split(/\s+/)
        .map(word => word.split('')
            .map(ch => {
                const charCode = ch.charCodeAt(0);
                return isAlnum(charCode) ? ch : '_00' + charCode.toString(16);
            })
            .join(''))
        .join('-');
    const firstCharCode = result.charCodeAt(0);
    return isAlpha(firstCharCode) ? result : 'g_t_00'
        + firstCharCode.toString(16) + result.substring(1);
}
