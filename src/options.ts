/**
 * options.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';

/**
 * Fetch extension option values.
 * 
 * See `contributes.configuration` of package.json for details.
 */
export default class Options {

    private static singleton?: Options;

    private static get instance() {
        return Options.singleton ??= new Options('texinfo');
    }

    static clear() {
        Options.singleton = undefined;
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

    static get noValidation() {
        return Options.instance.getBoolean('preview.noValidation');
    }

    static get noWarnings() {
        return Options.instance.getBoolean('preview.noWarnings');
    }

    static get displayImage() {
        return Options.instance.getBoolean('preview.displayImage');
    }

    private readonly configuration: vscode.WorkspaceConfiguration;

    private constructor(section: string) {
        this.configuration = vscode.workspace.getConfiguration(section);
    }

    private getString(section: string) {
        return this.configuration.get(section, '');
    }

    private getBoolean(section: string) {
        return this.configuration.get(section, false);
    }

    private getNumber(section: string) {
        return this.configuration.get(section, 0);
    }
}
