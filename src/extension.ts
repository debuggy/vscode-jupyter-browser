/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 * @author debuggy
 */

import {isNil} from 'lodash';
import * as path from 'path';
import * as querystring from 'querystring';
import * as vscode from 'vscode';

import * as util from 'common/util';
import { JupyterServerManager } from 'jupyterServerManager';

const jupyterManager: JupyterServerManager = new JupyterServerManager();
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
async function activate(context: vscode.ExtensionContext): Promise<void> {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable: vscode.Disposable = vscode.commands.registerCommand('extension.sayHello', async () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        const interpreter: string = util.getPythonInterpreter();
        void vscode.window.showInformationMessage(`the current python path: ${interpreter}`);
    });

    context.subscriptions.push(
        disposable,
        vscode.workspace.registerTextDocumentContentProvider('jupyter', {
            provideTextDocumentContent: (uri: vscode.Uri): string => `<script>window.location.href="${
                querystring.parse(uri.query).path
            }"</script>`
        }),
        vscode.commands.registerCommand('extension.preview', async () => {
            let text: string | undefined = await vscode.window.showInputBox({ prompt: 'Please input a URL' });
            if (isNil(text)) {
                void vscode.window.showInformationMessage('no url input');

                return;
            } else {
                if (!/^https?:\/\//.test(<string>text)) {
                    // tslint:disable-next-line:no-http-string
                    text = `http://${text}`;
                }
            }
            await vscode.commands.executeCommand('vscode.previewHtml', `jupyter:host?${
                querystring.stringify({ path: text })
            }`);
        }),
        vscode.commands.registerCommand('extension.loadJupyter', async () => {
            let text: string = await vscode.window.showInputBox({ prompt: 'Please input the url of existing jupyter server' });
            if (isNil(text)) {
                void vscode.window.showInformationMessage('no url input');

                return;
            }

            if (!/^https?:\/\//.test(text)) {
                // tslint:disable-next-line:no-http-string
                text = `http://${text}`;
            }

            if (isNil(text.match(/http:\/\/[a-zA-Z0-9.-]+:(\d+)\/\?token=([a-zA-Z0-9]+)/))) {
                const token: string = await vscode.window.showInputBox({ prompt: 'Please input the token of this jupyter server' });
                text = `${text}/?token=${token}`;
            }

            await vscode.commands.executeCommand('vscode.previewHtml', `jupyter:host?${
                querystring.stringify({ path: text })
            }`);
        }),
        vscode.commands.registerCommand('extension.startNewJupyter', async (uri: vscode.Uri) => {
            const rootDir: string = path.dirname(uri.fsPath);
            const fileName: string = path.basename(uri.fsPath);
            try {
                const endpoint: string = await jupyterManager.startJupyterServer(rootDir, fileName);
                await vscode.commands.executeCommand('vscode.previewHtml', `jupyter:notebook?${
                    querystring.stringify({ path: endpoint})
                }`);
            } catch (e) {
                void vscode.window.showErrorMessage(e.message);
            }
        }),
        // The extension host process has at most 5 seconds to shut down, after which it will exit no matter whether dispose is finished.
        new vscode.Disposable(async (): Promise<void> => { await jupyterManager.stopAllJupyterServers(); })
    );
}

exports.activate = activate;
