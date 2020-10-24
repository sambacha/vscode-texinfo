/**
 * utils.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as child_process from 'child_process';
import * as htmlparser from 'node-html-parser';
import * as vscode from 'vscode';

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
 * Transform and replace the `src` attribute value of all `img` elements from given HTML code using given function.
 * 
 * @param htmlCode 
 * @param transformer 
 * @returns The HTML code after transformation.
 */
export function transformHtmlImageUri(htmlCode: string, transformer: (src: string) => string) {
    const dom = htmlparser.parse(htmlCode);
    const elements = dom.querySelectorAll('img');
    elements.forEach(element => {
        const src = element.getAttribute('src');
        src && element.setAttribute('src', transformer(src));
    });
    // If nothing is transformed, return the original HTML code, for better performance.
    return elements.length === 0 ? htmlCode : dom.outerHTML;
}

export type Optional<T> = T | undefined;

export type ExecResult = { data?: string, error: string };

export type Range = { start: number, end: number };
