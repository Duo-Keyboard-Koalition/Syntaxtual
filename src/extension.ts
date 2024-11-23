import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Register a command that can be triggered from the command palette
    let disposable = vscode.commands.registerCommand('myextension.modifyCode', () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No editor is active');
            return;
        }

        // Read the current document text
        const document = editor.document;
        const text = document.getText();

        // Create a decoration type for highlighting
        const highlightDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255, 255, 0, 0.2)',
            border: '1px solid yellow'
        });

        // Example: Highlight a specific range
        const range = new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(0, 10)
        );
        editor.setDecorations(highlightDecorationType, [range]);

        // Example: Modify text
        editor.edit(editBuilder => {
            // Replace the entire text (you can modify this to target specific ranges)
            editBuilder.replace(
                new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(text.length)
                ),
                'Modified text'
            );
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {} 