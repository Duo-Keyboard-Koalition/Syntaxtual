import * as vscode from 'vscode';
import { callAPI } from './callParseAPI';
import { DialogueBox, Highlight } from './dialogueBox';

export async function onSaveEditor(context: vscode.ExtensionContext) {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active text editor');
        return;
    }

    const document = editor.document;
    const text = document.getText();

    // Dummy highlights for testing purposes
    const dummyHighlights: Highlight[] = [
        {
            lineNumber: 10, // Example line number
            startColumn: 5, // Example start column
            endColumn: 20, // Example end column
            highlightColor: 'rgba(255, 255, 0, 0.3)', // Light yellow background
            text: 'Explanation for highlight 1'
        },
        {
            lineNumber: 15, // Example line number
            startColumn: 3, // Example start column
            endColumn: 18, // Example end column
            highlightColor: 'rgba(255, 0, 0, 0.3)', // Light red background
            text: 'Explanation for highlight 2'
        }
    ];

    const dialogueBox = new DialogueBox(context, dummyHighlights);
    dialogueBox.show();

    // Create a terminal and show the "File saved" comment
    const terminal = vscode.window.createTerminal('File Save Terminal');
    terminal.sendText('echo "File saved"');
    document.save();
}