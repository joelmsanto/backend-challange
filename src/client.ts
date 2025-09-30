import WebSocket from "ws";
import { WSMessage } from "./types";


const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
  console.log("Connected to WebSocket server");
});

ws.on("message", (msg: WebSocket.RawData) => {
  try {
    const data = JSON.parse(msg.toString()) as { shortenedURL?: string };
    console.log("Received from server:", data);

    if (data.shortenedURL) {
      const ack: WSMessage = { type: "ack", shortenedURL: data.shortenedURL };
      ws.send(JSON.stringify(ack));
      console.log("ACK sent for:", data.shortenedURL);
    }
  } catch (err) {
    console.error("Error parsing message:", err);
  }
});
