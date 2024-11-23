import * as vscode from 'vscode';
import { callAPI } from './callParseAPI';
import { DialogueBox, Highlight } from './dialogueBox';

export async function onSaveEditor(context: vscode.ExtensionContext) {
    console.log('File saved');
    
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active text editor');
        return;
    }

    const document = editor.document;
    const text = "lorem ipsum"; // document.getText();

    // Dummy highlight for testing purposes
    const dummyHighlight: Highlight = {
        lineNumber: 10, // Example line number
        startColumn: 5, // Example start column
        endColumn: 20, // Example end column
        highlightColor: 'rgba(255, 255, 0, 0.3)' // Light yellow background
    };

    const highlights = [dummyHighlight]; // Use the dummy highlight for testing

    highlights.forEach(highlight => {
        const dialogueBox = new DialogueBox(context, highlight, text);
        dialogueBox.show();
    });
    


}