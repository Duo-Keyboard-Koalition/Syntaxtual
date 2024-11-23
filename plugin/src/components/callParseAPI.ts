import * as vscode from 'vscode';

interface AgentResponse {
  [lineNumber: number]: string;
}

interface Highlight {
  lineNumber: number;
  text: string;  // Changed from 'content' to 'text'
}

export async function callAPI(buffer: string): Promise<Highlight[]> {
    try {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active text editor');
            return [];
        }

        vscode.window.showInformationMessage('API call simulated: File saved');

        // finalize once the endpoints are done
        const url = "https://3.17.139.205:8000/parse";
        const agentResponse = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                codetext: buffer,
            })
        });

        if (!agentResponse.ok) {
            throw new Error(`HTTP error! status: ${agentResponse.status}`);
        }
        const response = await agentResponse.json() as AgentResponse;

        const highlights = Object.entries(response).map(([line, content]) => ({
          lineNumber: parseInt(line),
          text: content  // Changed from 'content' to 'text'
        }));

        return highlights;
    } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return [];
    }
}