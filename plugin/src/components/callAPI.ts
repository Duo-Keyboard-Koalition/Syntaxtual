import * as vscode from 'vscode';

interface Highlight {
    lineNumber: number;
    startColumn: number;
    endColumn: number;
    highlightColor: string;
}

interface AgentResponse {
    highlights: Highlight[];
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
        const url = "TBD";
        const agentResponse = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code: buffer,
            })
        });

        if (!agentResponse.ok) {
            throw new Error(`HTTP error! status: ${agentResponse.status}`);
        }
        const response = await agentResponse.json() as AgentResponse;

        return response.highlights;
    } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return [];
    }
}