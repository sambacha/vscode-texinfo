/**
 * utils.ts - Helper functions
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
 * @yields Whether the user clicked the "Confirm" button.
 */
export async function prompt(message: string, confirm: string) {
    return confirm === await vscode.window.showInformationMessage(message, confirm, 'Cancel');
}

/**
 * Execute command and get output.
 * 
 * @param path Path to the executable file.
 * @param args Arguments to be passed to the command.
 * @param maxBuffer Max output buffer size.
 * @yields The output data, or `undefined` if execution fails.
 */
export function exec(path: string, args: string[], maxBuffer: number) {
    return new Promise<string | undefined>((resolve) => {
        child_process.execFile(path, args, { maxBuffer: maxBuffer }, (error, stdout, stderr) => {
            if (stderr) {
                console.log(stderr);
            }
            if (error) {
                console.error(error);
                resolve(undefined);
            } else {
                resolve(stdout);
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
    elements.forEach((element) => {
        const src = element.getAttribute('src');
        src && element.setAttribute('src', transformer(src));
    })
    // If nothing is transformed, return the original HTML code, for better performance.
    return elements.length === 0 ? htmlCode : dom.outerHTML;
}
