import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { socketServer } from "./src/lib/socketServer";

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));

  const io = new Server(httpServer, {
    path: "/api/socket/io",
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  socketServer(io);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
