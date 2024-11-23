import * as vscode from 'vscode';

export function highlight(start: number, end: number, backgroundColor: string, borderColor: string) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        const range = new vscode.Range(document.positionAt(start), document.positionAt(end));
        
        const decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: backgroundColor,
            border: `1px solid ${borderColor}`
        });

        editor.setDecorations(decorationType, [{ range }]);
        vscode.window.showInformationMessage(`Characters from ${start} to ${end} highlighted`);
    } else {
        vscode.window.showErrorMessage('No active editor found');
    }
}