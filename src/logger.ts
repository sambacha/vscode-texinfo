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
export default class Logger implements vscode.Disposable {

    private static singleton?: Logger;

    static get instance() {
        return Logger.singleton ??= new Logger();
    }

    static log(message: string) {
        const dateTime = new Date().toLocaleString(undefined, { hour12: false });
        Logger.instance.outputChannel.appendLine(`[ ${dateTime} ]\n${message}`);
    }

    static show() {
        Logger.instance.outputChannel.show(true);
    }

    private outputChannel: vscode.OutputChannel;

    dispose() {
        Logger.instance.outputChannel.dispose();
        Logger.singleton = undefined;
    }

    private constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Texinfo');
    }
}
