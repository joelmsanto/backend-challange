import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { WebSocketServer, WebSocket } from "ws";
import { randomBytes } from "crypto";
import { WSMessage, PendingRetry, CreateUrlRequest } from "./types";

const app = express();
app.use(bodyParser.json());

const PORT = 3000;
const WSPORT = 8080;

const urlStore: Map<string, string> = new Map();

const wss = new WebSocketServer({ port: WSPORT });
let clientSocket: WebSocket | null = null;

const pendingRetries: Record<string, PendingRetry> = {};

function generateCode(): string {
  return randomBytes(3).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 5);
}

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");
  clientSocket = ws;

  ws.on("message", (msg: string) => {
    try {
      const data: WSMessage = JSON.parse(msg.toString());

      if (data.type === "ack") {
        console.log(`ACK received for: ${data.shortenedURL}`);
        if (pendingRetries[data.shortenedURL]) {
          clearInterval(pendingRetries[data.shortenedURL].interval);
          delete pendingRetries[data.shortenedURL];
        }
      }
    } catch (err) {
      console.error("Error parsing message:", err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clientSocket = null;
  });
});

app.post("/url", (req: Request<{}, {}, CreateUrlRequest>, res: Response) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Missing 'url' parameter" });
  }

  const code = generateCode();
  const shortenedURL = `http://localhost:${PORT}/${code}`;

  urlStore.set(code, url);

  if (clientSocket && clientSocket.readyState === WebSocket.OPEN) {
    let attempts = 0;

    const sendMessage = () => {
      if (attempts >= 3) {
        clearInterval(pendingRetries[shortenedURL]?.interval);
        console.log(`Failed to deliver shortened URL after 3 attempts: ${shortenedURL}`);
        delete pendingRetries[shortenedURL];
        return;
      }
      attempts++;
      console.log(`Sending shortened URL (try ${attempts}): ${shortenedURL}`);
      clientSocket?.send(JSON.stringify({ shortenedURL }));
    };

    const interval = setInterval(sendMessage, 3000);
    pendingRetries[shortenedURL] = { interval };
    sendMessage();
  } else {
    console.log("No WebSocket client connected. Cannot deliver shortened URL.");
  }

  res.status(200).json({ message: "Shortened URL will be sent via WebSocket" });
});


app.get("/:code", (req: Request, res: Response) => {
  const code = req.params.code;
  const url = urlStore.get(code);

  if (url) {
    res.json({ url });
  } else {
    res.status(404).json({ error: "Shortened URL not found" });
  }
});

app.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
});
