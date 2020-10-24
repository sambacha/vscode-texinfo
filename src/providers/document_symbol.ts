/**
 * providers/document_symbol.ts
 * 
 * @author CismonX <admin@cismon.net>
 * @license MIT
 */

import * as vscode from 'vscode';
import ContextMapping from '../context_mapping';

/**
 * Provide document symbol information for Texinfo documents.
 */
export default class DocumentSymbolProvider implements vscode.DocumentSymbolProvider {

    provideDocumentSymbols(document: vscode.TextDocument) {
        return ContextMapping.getDocumentContext(document).documentSymbol.values;
    }
}
