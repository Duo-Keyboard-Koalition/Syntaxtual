import * as vscode from 'vscode';
import { highlight } from './onHighlightEditor';

interface Section {
    start: number;
    end: number;
}
interface AgentResponse {
    highlights: {
        sections: Section[];
    };
}

export async function getCodeReview() {
    try {
        const editor = vscode.window.activeTextEditor;
        
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor');
            return;
        }

        vscode.window.showInformationMessage('API call simulated: File changed');
        
        // finalize once the endpoints are done
        //
        const url = "TBD";
        const agentResponse = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code: editor.document.getText(),
            })
        });

        if (!agentResponse.ok) {
            throw new Error(`HTTP error! status: ${agentResponse.status}`);
        }
        const highlightSection = await agentResponse.json() as AgentResponse;
        
        // highlight the sections that api flagged
        // use the highlight function from highlight.ts
        highlightSection.highlights.sections.forEach(section => {
            highlight(section.start, section.end, 'rgba(255, 255, 0, 0.3)', 'yellow');
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}