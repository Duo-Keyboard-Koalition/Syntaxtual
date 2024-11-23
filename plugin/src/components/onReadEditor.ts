import * as vscode from 'vscode';

export function getEditorContent() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        const firstTenChars = document.getText().slice(0, 10);
        const terminal = vscode.window.createTerminal('Print First 10 Chars');
        terminal.show();
        terminal.sendText(`echo "First 10 characters: ${firstTenChars}"`);
    } else {
        vscode.window.showErrorMessage('No active editor found');
    }
}