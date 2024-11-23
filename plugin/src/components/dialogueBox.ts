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
    private panel: vscode.WebviewPanel | undefined;

    constructor(
        private context: vscode.ExtensionContext,
        private highlight: Highlight,
        private text: string
    ) {}

    public show() {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active text editor');
            return;
        }

        this.highlightText(editor);

        this.panel = vscode.window.createWebviewPanel(
            'dialogueBox',
            'Dialogue Box',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        this.panel.webview.html = this.getWebviewContent(this.text);

        this.panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'send':
                        vscode.window.showInformationMessage(`Input received: ${message.text}`);
                        return;
                }
            },
            undefined,
            this.context.subscriptions
        );
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

    private getWebviewContent(text: string): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Dialogue Box</title>
            </head>
            <body>
                <h1>${text}</h1>
                <textarea id="input" rows="4" cols="50"></textarea><br>
                <button onclick="sendMessage()">Send</button>
                <script>
                    const vscode = acquireVsCodeApi();
                    function sendMessage() {
                        const input = document.getElementById('input').value;
                        vscode.postMessage({
                            command: 'send',
                            text: input
                        });
                    }
                </script>
            </body>
            </html>
        `;
    }
}