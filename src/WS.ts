import http from "http";
import WebSocket from "ws";

let value: number = 0;

export interface CustomSocket extends WebSocket {
  isAlive?: boolean;
}

export class WS {
  private heartbeat: ReturnType<typeof setInterval>;
  private wss: WebSocket.Server;

  constructor(server: http.Server) {
    this.wss = new WebSocket.Server({ server });
    this.wss.on("connection", (socket: CustomSocket) => this.handleConnection(socket));

    this.heartbeat = setInterval(() => {
      this.wss.clients.forEach((client: CustomSocket) => {
        if (client.isAlive === false) return client.terminate();

        client.ping(function () {});
        client.isAlive = false;
      });
    }, 15000);
  }

  private handleConnection(socket: CustomSocket) {
    socket.send(value);

    socket.isAlive = true;
    socket.on("pong", () => (socket.isAlive = true));

    socket.on("message", (raw) => {
      const data = raw.toString("utf-8");

      switch (data) {
        case "INCREMENT":
          value += 1;
          break;
        case "DECREMENT":
          value -= 1;
          break;
        default:
          return;
      }

      this.wss.clients.forEach((client) => client.send(value));
    });
  }
}
