// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { App } from './app';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "vscode-antd-helper" is now active!'
  );
  let app = new App();

  let disposable = vscode.commands.registerCommand('antd-helper.search', () => {
    const selection = app.getSeletedText();

    app.openDocs(selection, selection);
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
