import * as vscode from 'vscode';
import { insertDateTime } from './components/onWriteEditor';
import { getEditorContent } from './components/onReadEditor';
import { getCodeReview } from './components/onReviewEditor';
import { onUpdateEvent, clearFileChangeTimeout } from './components/onChangeEditor';
import { highlight } from './components/onHighlightEditor';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "sample-date-inserter" is now active!');

    let insertDateTimeDisposable = vscode.commands.registerCommand('sample-date-inserter.insertDateTime', insertDateTime);
    let getEditorContentDisposable = vscode.commands.registerCommand('sample-date-inserter.getEditorContent', getEditorContent);
    let getCodeReviewDisposable = vscode.commands.registerCommand('sample-date-inserter.getCodeReview', getCodeReview);
    let fileChangeDisposable = vscode.workspace.onDidChangeTextDocument(onUpdateEvent);
    let highlightDisposable = vscode.commands.registerCommand('sample-date-inserter.highlight', () => {
        highlight(0, 10, 'rgba(255, 255, 0, 0.3)', 'yellow');
    });

    context.subscriptions.push(
        insertDateTimeDisposable,
        getEditorContentDisposable,
        getCodeReviewDisposable,
        fileChangeDisposable,
        highlightDisposable
    );
}

export function deactivate() {
    clearFileChangeTimeout();
}