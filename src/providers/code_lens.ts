/**
 * providers/code_lens.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';
import ContextMapping from '../context_mapping';
import Options from '../options';

/**
 * Provide code lenses for Texinfo document.
 */
export default class CodeLensProvider implements vscode.CodeLensProvider {
    
    provideCodeLenses(document: vscode.TextDocument) {
        if (!Options.enableCodeLens) return undefined;
        return ContextMapping.getDocumentContext(document).foldingRange.nodeValues;
    }
}
