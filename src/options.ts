/**
 * options.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';

let options: Options | undefined;

/**
 * Get extension options.
 * 
 * See `contributes.configuration` of package.json for details.
 */
export class Options {

    private static get instance() {
        if (options === undefined) {
            options = new Options('texinfo');
        }
        return options;
    }

    static clear() {
        options = undefined;
    }

    static get makeinfo() {
        return Options.instance.getString('makeinfo');
    }

    static get noHeaders() {
        return Options.instance.getBoolean('preview.noHeaders');
    }

    static get maxSize() {
        return Options.instance.getNumber('preview.maxSize');
    }

    static get errorLimit() {
        return Options.instance.getNumber('preview.errorLimit');
    }

    static get force() {
        return Options.instance.getBoolean('preview.force');
    }

    static get noValidate() {
        return Options.instance.getBoolean('preview.noValidate');
    }

    static get noWarn() {
        return Options.instance.getBoolean('preview.noWarn');
    }

    static get displayImage() {
        return Options.instance.getBoolean('preview.displayImage');
    }

    private readonly configuration: vscode.WorkspaceConfiguration;

    private constructor(section: string) {
        this.configuration = vscode.workspace.getConfiguration(section);
    }

    private getString(section: string) {
        return this.configuration.get<string>(section) ?? '';
    }

    private getBoolean(section: string) {
        return this.configuration.get<boolean>(section) ?? false;
    }

    private getNumber(section: string) {
        return this.configuration.get<number>(section) ?? 0;
    }
}
