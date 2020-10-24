/**
 * providers/folding_range.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';
import ContextMapping from '../context_mapping';

/**
 * Provide folding range info for Texinfo documents.
 */
export default class FoldingRangeProvider implements vscode.FoldingRangeProvider {

    provideFoldingRanges(document: vscode.TextDocument) {
        return ContextMapping.getDocumentContext(document).foldingRange.values;
    }
}
