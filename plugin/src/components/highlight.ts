import * as vscode from 'vscode';

export function highlight() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        const firstTenCharsRange = new vscode.Range(document.positionAt(0), document.positionAt(10));
        
        const decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255, 255, 0, 0.3)', // Light yellow background
            border: '1px solid yellow'
        });

        editor.setDecorations(decorationType, [{ range: firstTenCharsRange }]);
        vscode.window.showInformationMessage('First 10 characters highlighted');
    } else {
        vscode.window.showErrorMessage('No active editor found');
    }
}