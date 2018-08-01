'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as querystring from 'querystring';
import {isNil} from 'lodash';
import * as util from './util';
import { JupyterServer } from './jupyterServer';
import * as path from 'path';
const fkill = require('fkill');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
async function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "JupyterTools4AI" is now active!');

    vscode.workspace.onDidCloseTextDocument((event) => {
        vscode.window.showInformationMessage("Closed document: " + event.fileName);
    });

    vscode.window.onDidChangeVisibleTextEditors((event) => {
        let documents: string[];
        util.channel.appendLine("Visible documents:");
        event.forEach((editor) => {
            documents.push(editor.document.fileName);
            util.channel.appendLine(editor.document.fileName);
        });

    });


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
        vscode.commands.registerCommand('extension.loadJupyter', async function () {
            let text = await vscode.window.showInputBox({ prompt: 'Please input the url of existing jupyter server' });
            if(isNil(text)) {
                vscode.window.showInformationMessage('no url input');
                return;
            }

            if (!/^https?:\/\//.test(text)) {
                text = `http://${text}`;
            }

            if (!text.match(/http:\/\/[a-zA-Z0-9.-]+:(\d+)\/\?token=([a-zA-Z0-9]+)/)) {
                let token = await vscode.window.showInputBox({ prompt: 'Please input the token of this jupyter server' });
                text = `${text}/?token=${token}`;
            }

            vscode.commands.executeCommand('vscode.previewHtml', `jupyter:host?${
                querystring.stringify({ path: text })
            }`);
        }),
        vscode.commands.registerCommand('extension.startNewJupyter', async function (uri: vscode.Uri) {
            const rootDir = path.dirname(uri.fsPath);
            const fileName = path.basename(uri.fsPath);
            const server = new JupyterServer(rootDir, fileName);
            try {
                await server.startServer();
                vscode.commands.executeCommand('vscode.previewHtml', `jupyter:notebook?${
                    querystring.stringify({ path: server.endpoint})
                }`);
            } catch (e) {
                vscode.window.showErrorMessage(e.message);
            } finally {
                if (!isNil(server.instance)) {
                    await fkill(server.instance.pid, {"force": true, "tree": true});
                }
            }
        })
    );
}

exports.activate = activate;

// this method is called when your extension is deactivated
export function deactivate() {
}