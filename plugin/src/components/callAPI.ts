import * as vscode from 'vscode';

interface Section {
    start: number;
    end: number;
}

interface AgentResponse {
    getHighlights: {
        sections: Section[];
    };
}

export async function callAPI(buffer: string): Promise<void> {
    try {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active text editor');
            return;
        }

        vscode.window.showInformationMessage('API call simulated: File changed');

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
        const getHighlightSection = await agentResponse.json() as AgentResponse;

        // getHighlight the sections that api flagged
        // use the getHighlight function from getHighlight.ts
        getHighlightSection.getHighlights.sections.forEach(section => {
            getHighlight(section.start, section.end, 'rgba(255, 255, 0, 0.3)', 'yellow');
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

function getHighlight(start: number, end: number, backgroundColor: string, borderColor: string) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        const range = new vscode.Range(document.positionAt(start), document.positionAt(end));
        
        const decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: backgroundColor,
            border: `1px solid ${borderColor}`
        });

        editor.setDecorations(decorationType, [{ range }]);
        vscode.window.showInformationMessage(`Characters from ${start} to ${end} getHighlighted`);
    } else {
        vscode.window.showErrorMessage('No active editor found');
    }
}