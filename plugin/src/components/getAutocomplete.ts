import * as vscode from 'vscode';
import { callAPI } from './callAPI';

let debounceTimeout: NodeJS.Timeout | undefined;
const DEBOUNCE_DELAY = 5000; // 5 seconds

export function getAutocomplete() {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active text editor');
        return;
    }

    if (debounceTimeout) {
        clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(() => {
        const document = editor.document;
        const text = document.getText();
        callAPI(text);
    }, DEBOUNCE_DELAY);
}