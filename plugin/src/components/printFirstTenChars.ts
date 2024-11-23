import * as vscode from 'vscode';

export function printFirstTenChars() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        const firstTenChars = document.getText().slice(0, 10);
        vscode.window.showInformationMessage(`First 10 characters: ${firstTenChars}`);
    } else {
        vscode.window.showErrorMessage('No active editor found');
    }
}