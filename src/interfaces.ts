export interface IncomingTransferPayload {
  senderId: string;
  fileName: string;
  fileSize: number;
}

export interface ReceiveChunkPayload {
  chunk: Uint8Array;
  index: number;
  totalChunks: number;
}
