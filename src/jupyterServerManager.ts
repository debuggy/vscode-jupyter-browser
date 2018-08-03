import { JupyterServer } from './jupyterServer';

export class JupyterServerManager {
    private serverList: JupyterServer[] = [];

    constructor() {}

    public async startJupyterServer(rootDir, fileName) {
        if (this.serverList.find((item) => { return item.rootDir === rootDir; })) {
            await this.serverList.setFileEndpoint(fileName);
        } else {
            const server  = new JupyterServer(rootDir, fileName);
            await server.startServer();
            this.serverList.push(server)
        }
    }

    public async stopJupyterServer(rootDir, fileName) {
        if (this.serverList.find((item) => { return item.rootDir === rootDir; })) {
            await this.serverList.setFileEndpoint(fileName);
        } else {
            const server  = new JupyterServer(rootDir, fileName);
            await server.startServer();
            this.serverList.push(server)
        }
    }



}