import http from "http";
import WebSocket from "ws";

export interface CustomSocket extends WebSocket {
  isAlive?: boolean;
}

export class WS {
  private heartbeat: ReturnType<typeof setInterval>;
  private wss: WebSocket.Server;

  constructor(server: http.Server) {
    this.wss = new WebSocket.Server({ server });
    this.wss.on("connection", (socket: CustomSocket) =>
      this.handleConnection(socket)
    );

    this.heartbeat = setInterval(() => {
      this.wss.clients.forEach((client: CustomSocket) => {
        if (client.isAlive === false) return client.terminate();

        client.ping(function () {});
        client.isAlive = false;
      });
    }, 15000);
  }

  private handleConnection(socket: CustomSocket) {
    socket.isAlive = true;
    socket.on("pong", () => (socket.isAlive = true));

    socket.on("message", (raw) => {
      const data = raw.toString("utf-8").trim();
      if (data === "") return;
      this.wss.clients.forEach((client) => client.send(data));
    });
  }
}
