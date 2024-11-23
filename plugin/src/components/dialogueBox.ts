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
          vscode.ViewColumn.Beside,  // Changed from One to Beside
          {
              enableScripts: true
          }
      );

      this.panel.webview.html = this.getWebviewContent(this.text);
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
              <style>
                  body {
                      padding: 0;
                      margin: 0;
                      background-color: var(--vscode-editor-background);
                      color: var(--vscode-editor-foreground);
                      font-family: var(--vscode-font-family);
                  }
                  .chat-container {
                      display: flex;
                      flex-direction: column;
                      height: 100vh;
                      padding: 16px;
                  }
                  .message-area {
                      flex-grow: 1;
                      margin-bottom: 16px;
                      background-color: var(--vscode-editor-background);
                      border-radius: 6px;
                      padding: 12px;
                  }
                  .input-container {
                      position: sticky;
                      bottom: 0;
                      background-color: var(--vscode-editor-background);
                      padding: 16px;
                      border-top: 1px solid var(--vscode-widget-border);
                  }
                  textarea {
                      width: 100%;
                      padding: 8px;
                      border: 1px solid var(--vscode-input-border);
                      background-color: var(--vscode-input-background);
                      color: var(--vscode-input-foreground);
                      border-radius: 4px;
                      resize: none;
                      font-family: inherit;
                  }
                  button {
                      margin-top: 8px;
                      padding: 6px 12px;
                      background-color: var(--vscode-button-background);
                      color: var(--vscode-button-foreground);
                      border: none;
                      border-radius: 4px;
                      cursor: pointer;
                  }
                  button:hover {
                      background-color: var(--vscode-button-hoverBackground);
                  }
              </style>
          </head>
          <body>
              <div class="chat-container">
                  <div class="message-area">
                      <h3>${text}</h3>
                  </div>
                  <div class="input-container">
                      <textarea id="input" rows="4" placeholder="Type your message..."></textarea>
                      <button onclick="sendMessage()">Send</button>
                  </div>
              </div>
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
