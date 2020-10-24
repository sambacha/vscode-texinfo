/**
 * logger.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';

/**
 * Logger which prints message to VSCode output channel.
 */
export default class Logger {

    private static singleton?: Logger;

    static get instance() {
        return Logger.singleton ??= new Logger();
    }

    static destroy() {
        Logger.instance.outputChannel.dispose();
        Logger.singleton = undefined;
    }

    private outputChannel: vscode.OutputChannel;

    private constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Texinfo');
    }

    log(message: string) {
        const dateTime = new Date().toLocaleString(undefined, { hour12: false });
        this.outputChannel.appendLine(`[ ${dateTime} ]\n${message}`);
    }

    show() {
        this.outputChannel.show(true);
    }
}
