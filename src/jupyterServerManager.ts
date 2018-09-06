/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 * @author debuggy
 */

import { isNil } from 'lodash';

import { JupyterServer } from 'jupyterServer';

/**
 * Class of jupyter server manager
 */
export class JupyterServerManager {
    private serverList: JupyterServer[] = [];

    public async startJupyterServer(rootDir: string, fileName: string): Promise<string | undefined> {
        let server: JupyterServer = this.serverList.find((item: JupyterServer) => { return item.rootDir === rootDir; });
        if (!isNil(server)) {
            server.setEndpoint(fileName);
        } else {
            server  = new JupyterServer(rootDir, fileName);
            await server.startServer();
            this.serverList.push(server);
        }

        return server.endpoint;
    }

    public async stopAllJupyterServers(): Promise<void> {
        await Promise.all(this.serverList.map(async (server: JupyterServer) => {
            await server.stopServer();
        }));
    }
}
