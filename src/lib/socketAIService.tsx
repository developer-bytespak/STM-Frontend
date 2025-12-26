import { io, Socket } from 'socket.io-client';
import { authCookies } from './cookies';

class SocketAIService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket && this.socket.connected) return this.socket;

    // Get JWT token from cookies (where it's actually stored)
    const token = authCookies.getAccessToken();
    
    if (!token) {
      console.warn('⚠️ No JWT token found - AI socket cannot connect');
      return null;
    }

    const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    this.socket = io(`${SOCKET_URL}/ai`, {
      auth: {
        token, // Send JWT token for authentication
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ AI socket connected - Socket ID:', this.socket?.id);
    });

    this.socket.on('connected', (data: any) => {
      console.log('🤖 Connected to AI assistant:', data);
    });

    this.socket.on('connect_error', (err: any) => {
      console.error('❌ AI socket connect error:', err?.message || err);
    });

    this.socket.on('error', (data: any) => {
      console.error('❌ AI socket error:', data);
    });

    return this.socket;
  }

  sendMessage(message: string) {
    if (!this.socket) {
      console.warn('⚠️ AI Socket not connected, attempting to connect...');
      this.connect();
    }
    if (!this.socket?.connected) {
      console.error('❌ AI Socket is not connected');
      return;
    }
    console.log('📤 Sending AI message:', message);
    this.socket?.emit('message', { message }); // Match backend event name
  }

  onResponse(cb: (data: { message?: string; error?: string; summary?: string }) => void) {
    if (!this.socket) this.connect();
    this.socket?.on('ai-response', cb); // Match backend event name
  }

  offResponse() {
    this.socket?.off('ai-response');
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketAIService = new SocketAIService();
