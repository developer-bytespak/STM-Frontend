import { io, Socket } from 'socket.io-client';

class SocketAIService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket && this.socket.connected) return this.socket;

    const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    this.socket = io(`${SOCKET_URL}/ai`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('AI socket connected', this.socket?.id);
    });

    this.socket.on('connect_error', (err: any) => {
      console.error('AI socket connect error', err?.message || err);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(message: string) {
    if (!this.socket) this.connect();
    this.socket?.emit('ai_message', { message });
  }

  onResponse(cb: (data: { message?: string; error?: string }) => void) {
    if (!this.socket) this.connect();
    this.socket?.on('ai_response', cb);
  }

  offResponse() {
    this.socket?.off('ai_response');
  }
}

export const socketAIService = new SocketAIService();
