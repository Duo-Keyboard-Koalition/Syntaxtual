import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "sample-date-inserter" is now active!');

	let insertDateTimeDisposable = vscode.commands.registerCommand('sample-date-inserter.insertDateTime', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const currentDateTime = new Date().toLocaleString();
			editor.edit(editBuilder => {
				editBuilder.insert(editor.selection.active, currentDateTime);
			}).then(success => {
				if (success) {
					vscode.window.showInformationMessage(`Inserted date and time: ${currentDateTime}`);
				} else {
					vscode.window.showErrorMessage('Failed to insert date and time');
				}
			});
		} else {
			vscode.window.showErrorMessage('No active editor found');
		}
	});

	let printFirstTenCharsDisposable = vscode.commands.registerCommand('sample-date-inserter.printFirstTenChars', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const firstTenChars = document.getText().slice(0, 10);
			vscode.window.showInformationMessage(`First 10 characters: ${firstTenChars}`);
		} else {
			vscode.window.showErrorMessage('No active editor found');
		}
	});

	context.subscriptions.push(insertDateTimeDisposable, printFirstTenCharsDisposable);
}

export function deactivate() {}

