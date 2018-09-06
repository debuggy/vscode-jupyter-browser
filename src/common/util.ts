/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 * @author debuggy
 */

import { WorkspacePythonPath } from 'contracts';
import { isNil } from 'lodash';
import * as vscode from 'vscode';

export const channel: vscode.OutputChannel = vscode.window.createOutputChannel('Jupyter AI Output');

export function getPythonInterpreter(): string | undefined {
    const workspaceFolders: vscode.WorkspaceFolder[] | undefined = vscode.workspace.workspaceFolders;
    const setInterpreterGlobally: boolean = !Array.isArray(workspaceFolders) || workspaceFolders.length === 0;
    let wkspace: vscode.Uri | undefined;

    if (!setInterpreterGlobally) {
        const targetConfig: WorkspacePythonPath = getWorkspaceToSetPythonPath();
        if (isNil(targetConfig)) {
            return undefined;
        }
        wkspace = targetConfig.folderUri;
    }

    const pythonConfig: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('python', wkspace);

    return pythonConfig.get<string>('pythonPath');
}

function getWorkspaceToSetPythonPath(): WorkspacePythonPath | undefined {
    if (!Array.isArray(vscode.workspace.workspaceFolders) || vscode.workspace.workspaceFolders.length === 0) {
        return undefined;
    }
    if (vscode.workspace.workspaceFolders.length === 1) {
        return { folderUri: vscode.workspace.workspaceFolders[0].uri, configTarget: vscode.ConfigurationTarget.Workspace };
    }

    // const applicationShell = this.serviceContainer.get<IApplicationShell>(IApplicationShell);
    // const workspaceFolder = await applicationShell.showWorkspaceFolderPick({ placeHolder: 'Select a workspace' });
    // return workspaceFolder ? { folderUri: workspaceFolder.uri, configTarget: ConfigurationTarget.WorkspaceFolder } : undefined;
}
