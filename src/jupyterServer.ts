/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 * @author debuggy
 */

import * as cp from 'child_process';
import {isNil} from 'lodash';
import * as path from 'path';
import * as kill from 'tree-kill';
import * as util from 'util';

export class JupyterServer {
    public token: string;
    public port: number;
    public endpoint: string;
    public rootDir: string;
    public instance: cp.ChildProcess;

    private fileName: string;
    private startingServerPromise: Promise<void> = Promise.resolve();

    constructor(dir: string, fileName: string) {
        this.rootDir = dir;
        this.fileName = fileName;
        this.token = 'abcd';
    }

    public async startServer(): Promise<void> {
        const isInstalled: boolean = true;

        if (isInstalled) {
            await this.startServerInner();
        } else {
            throw new Error('Jupyter not installed!');
        }
    }

    public async stopServer(): Promise<void> {
        if (!isNil(this.instance)) {
            await kill(this.instance.pid);
        }
    }

    public setEndpoint(fileName: string): void {
        this.endpoint = `http://localhost:${this.port}/notebooks/${fileName}?token=${this.token}`;
    }

    private async startServerInner(): Promise<void> {
        this.startingServerPromise = new Promise((resolve: () => void, reject: (e: Error) => void): void => {
            const pythonPath: string = util.getPythonInterpreter();
            if (isNil(pythonPath)) {
                reject(new Error('no python interpreter found'));
            } else {
                const pythonBaseDir: string = path.dirname(pythonPath);
                this.instance = cp.spawn(
                    path.join(pythonBaseDir, 'Scripts', 'jupyter-notebook.exe'),
                    ['--no-browser', `--NotebookApp.token=${this.token}`, `--notebook-dir=${this.rootDir}`]);
            }
            const outputTimeout: NodeJS.Timer = setTimeout(
                () => {
                    util.channel.appendLine('Starting jupyter server timed out.');
                    if (!isNil(this.instance)) {
                        this.instance.kill();
                    } else {
                        reject(new Error('No process running!'));
                    }
                },
                10000
            );
            const handler: Function = (data: string | Buffer): void => {
                const pattern: RegExp = /http:\/\/localhost:(\d+)\/\?token=/;
                util.channel.appendLine('handler enter!');
                const match: string[] = data.toString().match(pattern);
                util.channel.appendLine(`compare: ${data.toString()}`);
                if (!isNil(match)) {
                    this.port = match[1];
                    this.endpoint = `http://localhost:${match[1]}/notebooks/${this.fileName}?token=${this.token}`;
                }
                if (!isNil(this.endpoint) && !isNil(this.port)) {
                    if (!isNil(this.instance)) {
                        this.instance.stderr.removeListener('data', handler);
                    }
                    clearTimeout(outputTimeout);
                    resolve();
                }
            };
            // this.instance!.stdout.on('data', handler);
            // this.instance!.stdout.on('data', (data: string | Buffer): void => {
            //     util.channel.appendLine(`Flask Stdout: ${data.toString()}`);
            // });
            this.instance.stderr.on('data', handler);
            this.instance.stderr.on('data', (data: string | Buffer): void => {
                util.channel.appendLine(`Flask Stderr: ${data.toString()}`);
            });
            this.instance.on('error', () => {
                if (!isNil(this.instance)) {
                    this.instance.removeAllListeners();
                }
                this.instance = null;
                reject(new Error('Starting local flask server failed.'));
            });
            this.instance.on('close', () => {
                if (!isNil(this.instance)) {
                    this.instance.removeAllListeners();
                }
                this.instance = null;
                reject(new Error('Starting local flask server failed.'));
            });
        });
        await this.startingServerPromise;
    }
}
