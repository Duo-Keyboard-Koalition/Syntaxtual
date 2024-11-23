import * as vscode from 'vscode';

let fileChangeTimeout: NodeJS.Timeout | undefined;

export function onUpdateEvent() {
    if (fileChangeTimeout) {
        clearTimeout(fileChangeTimeout);
    }
    fileChangeTimeout = setTimeout(() => {
        vscode.commands.executeCommand('sample-date-inserter.getCodeReview');
    }, 1000); // Debounce for 1 second
}

export function clearFileChangeTimeout() {
    if (fileChangeTimeout) {
        clearTimeout(fileChangeTimeout);
    }
}