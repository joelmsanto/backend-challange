
export interface WSMessage {
  type: "ack";
  shortenedURL: string;
}


export interface PendingRetry {
  interval: NodeJS.Timeout;
}


export interface CreateUrlRequest {
  url: string;
}
