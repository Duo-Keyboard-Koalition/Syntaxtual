import * as vscode from 'vscode';

export function insertDateTime() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const currentDateTime = new Date().toLocaleString();
        editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, currentDateTime);
        }).then(success => {
            if (success) {
                vscode.window.showInformationMessage(`Inserted date and time: ${currentDateTime}`);
            } else {
                vscode.window.showErrorMessage('Failed to insert date and time');
            }
        });
    } else {
        vscode.window.showErrorMessage('No active editor found');
    }
}