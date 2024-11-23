import * as vscode from 'vscode';

export class Highlight {
    constructor(
        public lineNumber: number,
        public startColumn: number,
        public endColumn: number,
        public highlightColor: string
    ) {}
}

export class DialogueBox {
    constructor(
        private context: vscode.ExtensionContext,
        private highlight: Highlight,
        private text: string
    ) {}

    public async show() {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active text editor');
            return;
        }

        this.highlightText(editor);

        const input = await vscode.window.showInputBox({
            prompt: this.text,
            placeHolder: 'Enter your input'
        });

        if (input !== undefined) {
            vscode.window.showInformationMessage(`Input received: ${input}`);
        }
    }

    private highlightText(editor: vscode.TextEditor) {
        const startPos = new vscode.Position(this.highlight.lineNumber, this.highlight.startColumn);
        const endPos = new vscode.Position(this.highlight.lineNumber, this.highlight.endColumn);
        const range = new vscode.Range(startPos, endPos);

        const decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: this.highlight.highlightColor,
            border: '1px solid yellow'
        });

        editor.setDecorations(decorationType, [{ range }]);
    }
}