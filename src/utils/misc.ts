/**
 * utils/misc.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
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
    return new Promise<ExecResult>(resolve => {
        child_process.execFile(path, args, { maxBuffer: maxBuffer }, (error, stdout, stderr) => {
            if (error) {
                resolve({ error: stderr ? stderr : error.message });
            } else {
                resolve({ data: stdout, error: stderr });
            }
        });
    });
}

/**
 * Open a prompt with two buttons, "Confirm" and "Cancel", and wait for user action.
 * 
 * @param message The message to be displayed on the prompt.
 * @param confirm Text to be displayed on the "Confirm" button.
 * @param error Whether the prompt is shown as an error message. Default false.
 * @returns Whether the user clicked the "Confirm" button.
 */
export async function prompt(message: string, confirm: string, error = false) {
    const func = error ? vscode.window.showErrorMessage : vscode.window.showInformationMessage;
    return confirm === await func(message, confirm, 'Cancel');
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
