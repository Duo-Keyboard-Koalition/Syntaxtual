import * as vscode from 'vscode';
import { insertDateTime } from './components/onWriteEditor';
import { getEditorContent } from './components/onReadEditor';
import { getCodeReview } from './components/onReviewEditor';
import { onUpdateEvent, clearFileChangeTimeout } from './components/onChangeEditor';
import { highlight } from './components/onHighlightEditor';
import { onSaveEditor } from './components/onSaveEditor';
export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "syntaxtual" is now active!');

    let insertDateTimeDisposable = vscode.commands.registerCommand('syntaxtual.insertDateTime', insertDateTime);
    let getEditorContentDisposable = vscode.commands.registerCommand('syntaxtual.getEditorContent', getEditorContent);
    let getCodeReviewDisposable = vscode.commands.registerCommand('syntaxtual.getCodeReview', getCodeReview);
    let fileChangeDisposable = vscode.workspace.onDidChangeTextDocument(onUpdateEvent);
    let highlightDisposable = vscode.commands.registerCommand('syntaxtual.highlight', () => {
        highlight(0, 10, 'rgba(255, 255, 0, 0.3)', 'yellow');
    });
	let saveDisposable = vscode.commands.registerCommand('syntaxtual.onSaveEditor', () => onSaveEditor(context));
    
    context.subscriptions.push(
        insertDateTimeDisposable,
        getEditorContentDisposable,
        getCodeReviewDisposable,
        fileChangeDisposable,
        highlightDisposable,
		saveDisposable
    );
}

export function deactivate() {
    clearFileChangeTimeout();
}