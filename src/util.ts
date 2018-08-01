import * as vscode from 'vscode';
import {WorkspacePythonPath} from './contracts';

export const channel = vscode.window.createOutputChannel('Jupyter AI Output');

export function getPythonInterpreter(): string | undefined {
    const workspaceFolders: vscode.WorkspaceFolder[] | undefined = vscode.workspace.workspaceFolders;
    const setInterpreterGlobally: boolean = !Array.isArray(workspaceFolders) || workspaceFolders.length === 0;
    let wkspace: vscode.Uri | undefined;

    if (!setInterpreterGlobally) {
        const targetConfig = getWorkspaceToSetPythonPath();
        if (!targetConfig) {
            return undefined;
        }
        wkspace = targetConfig.folderUri;
    }

    const pythonConfig = vscode.workspace.getConfiguration('python', wkspace);
    const pythonPath = pythonConfig.get<string>('pythonPath');

    return pythonPath; 
}       

function getWorkspaceToSetPythonPath(): WorkspacePythonPath | undefined {
    if (!Array.isArray(vscode.workspace.workspaceFolders) || vscode.workspace.workspaceFolders.length === 0) {
        return undefined;
    }
    if (vscode.workspace.workspaceFolders.length === 1) {
        return { folderUri: vscode.workspace.workspaceFolders[0].uri, configTarget: vscode.ConfigurationTarget.Workspace };
    }

    // TODO: Ok we have multiple interpreters, get the user to pick a folder.
    // const applicationShell = this.serviceContainer.get<IApplicationShell>(IApplicationShell);
    // const workspaceFolder = await applicationShell.showWorkspaceFolderPick({ placeHolder: 'Select a workspace' });
    // return workspaceFolder ? { folderUri: workspaceFolder.uri, configTarget: ConfigurationTarget.WorkspaceFolder } : undefined;
}

export const channel = vscode.window.createOutputChannel('jupyterTools4AI');