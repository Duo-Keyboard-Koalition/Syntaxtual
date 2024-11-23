import * as vscode from 'vscode';

export async function replaceLines(newLines: string[], startLine: number, endLine: number): Promise<boolean> {
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
        vscode.window.showErrorMessage('No active text editor');
        return false;
    }

    try {
        // Convert 0-based to 1-based line numbers
        const start = new vscode.Position(startLine - 1, 0);
        const end = new vscode.Position(endLine, 0);
        const range = new vscode.Range(start, end);

        // Join the new lines with line endings
        const newContent = newLines.join('\n');

        // Create and apply the edit
        const edit = new vscode.WorkspaceEdit();
        edit.replace(editor.document.uri, range, newContent);
        
        return await vscode.workspace.applyEdit(edit);
    } catch (error) {
        vscode.window.showErrorMessage(`Error replacing lines: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return false;
    }
}