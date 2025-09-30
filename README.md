# URL Shortener with WebSocket Delivery

This project is a simple URL shortener service with WebSocket-based delivery and acknowledgment handling.  
When a new URL is shortened via the REST API, the shortened URL is sent to a connected WebSocket client with retry logic until acknowledgment is received.

## Features
- Shorten URLs via REST API.
- Store shortened URLs in memory.
- Deliver shortened URLs to WebSocket clients.
- Retry up to 3 times if acknowledgment is not received.
- Acknowledge receipt of shortened URLs from the client.
- Lookup original URLs by shortened code.

## Tech Stack
- **Node.js / TypeScript**
- **Express** (REST API)
- **ws** (WebSocket communication)
- **crypto** (short code generation)


## Run Locally
```bash
npm install
npm run dev
```
- REST API runs on **http://localhost:3000**
- WebSocket server runs on **ws://localhost:8080**


## Endpoints
### `POST /url`
Create a shortened URL.  
**Request body:**
```json
{ "url": "https://example.com" }
```
**Response:**
```json
{ "message": "Shortened URL will be sent via WebSocket" }
```

### `GET /:code`
Retrieve the original URL from a shortened code.  
**Example:**  
`GET http://localhost:3000/abc12` →  
```json
{ "url": "https://example.com" }
```

## WebSocket Client
- Connects to `ws://localhost:8080`.
- Receives shortened URLs.
- Sends back an acknowledgment (`ack`).
