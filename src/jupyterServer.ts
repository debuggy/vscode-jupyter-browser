import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as util from './util';
import * as path from 'path';
import {isNil} from 'lodash';
var exec = require('child-process-promise').exec;



export class JupyterServer {
    public token: string;
    public port: string = '';
    public endpoint: string = '';

    private isRunning: boolean = false;
    private rootDir: string;

    private instance: cp.ChildProcess | null = null;

    constructor(dir: string) {
        this.rootDir = dir;
        this.token = 'abcd';
    }
    
    public async startServer(): Promise<void> {
        const isInstalled: boolean = true; // TODO: there should be a func to check installation of jupyter

        if(isInstalled) {
            await this.startServerInner();
            vscode.window.showInformationMessage('start');
        } else {
            throw new Error('Jupyter not installed!');
        }
    }

    private async startServerInner(): Promise<void> {
        // this.startingServerPromise = new Promise((resolve: () => void, reject: (e: Error) => void): void => {
        const pythonPath = util.getPythonInterpreter();
        if (isNil(pythonPath)) {
            throw new Error('no python interpreter found');
        } else {
            const pythonBaseDir = path.dirname(pythonPath); 
            const cmd = `${path.join(pythonBaseDir, 'Scripts', 'jupyter.exe')} notebook --allow-root --no-browser --NotebookApp.token=${this.token} --notebook-dir=${this.rootDir}`;
            const { data , stderr } = await exec(cmd);
            const pattern = /http:\/\/localhost:(\d+)\/\?token=/;
            let match: string[] | null = data.toString().match(pattern);
            util.channel.appendLine(`compare: ${data.toString()}`);
            if (!isNil(match)) {
                this.port = match[1];
                this.endpoint = `http://localhost:${match[1]}/?token=${this.token}`;
            } 
            util.channel.appendLine(stderr);
        }
        //     const outputTimeout: NodeJS.Timer = setTimeout(
        //         () => {
        //             if (!isNil(this.instance)) {
        //                 this.instance.kill();
        //             }
        //             vscode.window.showErrorMessage('Starting local flask server timed out.');
        //         },
        //         60000
        //     );
        //     const handler: Function = (data: string | Buffer): void => {
        //         const pattern = /http:\/\/localhost:(\d+)\/\?token=/;
        //         localUtil.channel.appendLine('handler enter!');
        //         let match: string[] | null = data.toString().match(pattern);
        //         localUtil.channel.appendLine(`compare: ${data.toString()}`);
        //         if (!isNil(match)) {
        //             this.port = match[1];
        //             this.endpoint = `http://localhost:${match[1]}/?token=${this.token}`;
        //         }
        //         if (!isNil(this.endpoint) && !isNil(this.port)) {
        //             this.isRunning = true;
        //             if (!isNil(this.instance)) {
        //                 this.instance.stdout.removeListener('data', handler);
        //             }
        //             clearTimeout(outputTimeout);
        //             resolve();
        //         }
        //     };
        //     this.instance.stdout.on('data', handler);
        //     this.instance.stdout.on('data', (data: string | Buffer): void => {
        //         localUtil.channel.appendLine(`Flask Stdout: ${data.toString()}`);
        //     });
        //     this.instance.stderr.on('data', (data: string | Buffer): void => {
        //         void localUtil.channel.appendLine(`Flask Stderr: ${data.toString()}`);
        //     });
        //     this.instance.on('error', () => {
        //         this.isRunning = false;
        //         if (!isNil(this.instance)) {
        //             this.instance.removeAllListeners();
        //         }
        //         this.instance = null;
        //         reject(new Error('Starting local flask server failed.'));
        //     });
        //     this.instance.on('close', () => {
        //         this.isRunning = false;
        //         if (!isNil(this.instance)) {
        //             this.instance.removeAllListeners();
        //         }
        //         this.instance = null;
        //         reject(new Error('Starting local flask server failed.'));
        //     });
        // });     
        // await this.startingServerPromise;
    }

    public async stopServer(): Promise<void> {
        if (this.isRunning === true && !isNil(this.instance)) {
            this.instance.kill();
        }
    }

}