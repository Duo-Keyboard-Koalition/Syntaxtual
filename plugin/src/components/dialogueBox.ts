import * as vscode from 'vscode';

export class Highlight {
    constructor(
        public lineNumber: number,
        public startColumn: number,
        public endColumn: number,
        public highlightColor: string,
        public text: string // Add text property to Highlight
    ) {}
}

export class DialogueBox {
    private static currentPanel: vscode.WebviewPanel | undefined;

    constructor(
        private context: vscode.ExtensionContext,
        private highlights: Highlight[] // Accept a list of highlights
    ) {}

    public async show() {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active text editor');
            return;
        }

        this.highlights.forEach(highlight => this.highlightText(editor, highlight));

        if (DialogueBox.currentPanel) {
            DialogueBox.currentPanel.reveal(vscode.ViewColumn.Beside);
        } else {
            DialogueBox.currentPanel = vscode.window.createWebviewPanel(
                'dialogueBox',
                'Dialogue Box',
                vscode.ViewColumn.Beside, // Open the webview beside the current editor
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            DialogueBox.currentPanel.onDidDispose(() => {
                DialogueBox.currentPanel = undefined;
            }, null, this.context.subscriptions);
        }

        DialogueBox.currentPanel.webview.html = this.getWebviewContent();
    }

    private highlightText(editor: vscode.TextEditor, highlight: Highlight) {
        const startPos = new vscode.Position(highlight.lineNumber, highlight.startColumn);
        const endPos = new vscode.Position(highlight.lineNumber, highlight.endColumn);
        const range = new vscode.Range(startPos, endPos);

        const decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: highlight.highlightColor,
            border: '1px solid yellow'
        });

        editor.setDecorations(decorationType, [{ range }]);
    }

    private getWebviewContent(): string {
        const highlightsHtml = this.highlights.map(highlight => `
            <div>
                <h2>Line ${highlight.lineNumber}, Columns ${highlight.startColumn}-${highlight.endColumn}</h2>
                <p>${highlight.text}</p>
            </div>
        `).join('');

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Dialogue Box</title>
            </head>
            <body>
                ${highlightsHtml}
            </body>
            </html>
        `;
    }
}