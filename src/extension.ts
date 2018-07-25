'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as querystring from 'querystring';
import {isNil} from 'lodash';
import * as util from './util';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
async function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "JupyterTools4AI" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', async () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        const interpreter = await util.getPythonInterpreter();
        vscode.window.showInformationMessage(`the current python path: ${interpreter}`);
    });

    context.subscriptions.push(
        disposable,
        vscode.workspace.registerTextDocumentContentProvider('jupyter', {
            provideTextDocumentContent: uri => `<script>window.location.href="${
                querystring.parse(uri.query)['path']
            }"</script>`
        }),
        vscode.commands.registerCommand('extension.preview', async function () {
            let text: string | undefined = await vscode.window.showInputBox({ prompt: 'Please input a URL' });
            if(isNil(text)) {
                vscode.window.showInformationMessage('no url input');
                return;
            } else {
                if (!/^https?:\/\//.test(<string>text)) {
                    text = `http://${text}`;
                }
            }
            vscode.commands.executeCommand('vscode.previewHtml', `jupyter:host?${
                querystring.stringify({ path: text })
            }`);
        }),
        vscode.commands.registerCommand('extension.webview', async function () {
            let text = await vscode.window.showInputBox({ prompt: 'Please input a URL' });
            if(isNil(text)) {
                vscode.window.showInformationMessage('no url input');
                return;
            } else {
                if (!/^https?:\/\//.test(text)) {
                    text = `http://${text}`;
                }
                const panel = vscode.window.createWebviewPanel(
                    `preview:${text}`,
                    text,
                    vscode.ViewColumn.Active,
                    {
                        retainContextWhenHidden: true,
                        enableScripts: true
                    }
                );
                panel.webview.html = `<script>window.location.href="${text}"</script>`;
            }
        })
    );
}

exports.activate = activate;

// this method is called when your extension is deactivated
export function deactivate() {
}