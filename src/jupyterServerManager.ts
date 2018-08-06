import { JupyterServer } from './jupyterServer';
import { isNil } from 'lodash';

export class JupyterServerManager {
    private serverList: JupyterServer[] = [];

    constructor() {}

    public async startJupyterServer(rootDir: string, fileName: string): Promise<string | undefined> {
        let server = this.serverList.find((item) => { return item.rootDir === rootDir;});
        if (!isNil(server)) {
            server.setEndpoint(fileName);
        } else {
            server  = new JupyterServer(rootDir, fileName);
            await server.startServer();
            this.serverList.push(server)
        }
        return server.endpoint;
    }

    public async stopAllJupyterServers(): Promise<void> {
        await Promise.all(this.serverList.map(async (server) => await server.stopServer()));
    }
}