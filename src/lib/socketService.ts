import { io, Socket } from 'socket.io-client';
import { authCookies } from './cookies';

/**
 * Socket Service for managing real-time chat connections
 * Handles Socket.IO connection to the backend chat gateway
 */
class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;

  /**
   * Connect to Socket.IO server
   * Uses JWT token from cookies for authentication
   */
  connect(): Socket | null {
    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      console.log('⏳ Socket connection already in progress...');
      return this.socket;
    }

    // If already connected, return existing socket
    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      return this.socket;
    }

    this.isConnecting = true;

    try {
      // Get JWT token from cookies
      const token = authCookies.getAccessToken();
      
      if (!token) {
        console.error('❌ No access token found - cannot connect to socket');
        this.isConnecting = false;
        return null;
      }

      // Backend URL - use the same as API URL
      const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      console.log('🔌 Connecting to socket server:', `${SOCKET_URL}/chat`);

      // Create socket connection to /chat namespace
      this.socket = io(`${SOCKET_URL}/chat`, {
        auth: {
          token, // JWT token for authentication
        },
        transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 10000,
      });

      this.setupEventListeners();
      this.isConnecting = false;

      return this.socket;
    } catch (error) {
      console.error('❌ Failed to create socket connection:', error);
      this.isConnecting = false;
      return null;
    }
  }

  /**
   * Setup event listeners for socket events
   */
  private setupEventListeners() {
    if (!this.socket) return;

    // Connection successful
    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    // Backend confirms connection
    this.socket.on('connected', (data: { message: string; userId: number }) => {
      console.log('🎉 Backend confirmed connection:', data);
    });

    // Disconnection
    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ Socket disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected us (probably auth issue)
        console.warn('⚠️ Server disconnected the socket - auth may have failed');
      }
    });

    // Connection error
    this.socket.on('connect_error', (error: Error) => {
      console.error('❌ Socket connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('💔 Max reconnection attempts reached');
        this.disconnect();
      }
    });

    // Backend error event
    this.socket.on('error', (data: { message: string }) => {
      console.error('❌ Socket error from backend:', data.message);
    });

    // Successfully joined a chat
    this.socket.on('joined_chat', (data: { chatId: string; message: string }) => {
      console.log('✅ Joined chat successfully:', data);
    });

    // Left a chat
    this.socket.on('left_chat', (data: { chatId: string }) => {
      console.log('👋 Left chat:', data.chatId);
    });

    // User joined the chat
    this.socket.on('user_joined', (data: { userId: number; chatId: string }) => {
      console.log('👤 User joined chat:', data);
    });

    // User left the chat
    this.socket.on('user_left', (data: { userId: number; chatId: string }) => {
      console.log('👋 User left chat:', data);
    });
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Get current socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // ==========================================
  // CHAT ROOM METHODS
  // ==========================================

  /**
   * Join a specific chat room
   */
  joinChat(chatId: string) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected - cannot join chat');
      return;
    }

    console.log('📥 Joining chat:', chatId);
    this.socket.emit('join_chat', { chatId });
  }

  /**
   * Leave a specific chat room
   */
  leaveChat(chatId: string) {
    if (!this.socket?.connected) {
      return;
    }

    console.log('📤 Leaving chat:', chatId);
    this.socket.emit('leave_chat', { chatId });
  }

  // ==========================================
  // MESSAGE METHODS
  // ==========================================

  /**
   * Send a message to a chat
   */
  sendMessage(
    chatId: string,
    message: string,
    message_type: 'text' | 'image' | 'document' = 'text'
  ) {
    if (!this.socket?.connected) {
      console.error('❌ Socket not connected - cannot send message');
      throw new Error('Socket not connected');
    }

    console.log('💬 Sending message to chat:', chatId);
    this.socket.emit('send_message', {
      chatId,
      message,
      message_type,
    });
  }

  /**
   * Listen for new messages
   */
  onNewMessage(callback: (data: {
    id: string;
    chatId: string;
    sender_type: 'customer' | 'service_provider' | 'local_service_manager';
    sender_id: number;
    message: string;
    message_type: 'text' | 'image' | 'document';
    created_at: string;
  }) => void) {
    if (!this.socket) {
      console.warn('⚠️ Socket not available for onNewMessage');
      return;
    }

    this.socket.on('new_message', callback);
  }

  /**
   * Stop listening for new messages
   */
  offNewMessage() {
    if (this.socket) {
      this.socket.off('new_message');
    }
  }

  // ==========================================
  // TYPING INDICATOR METHODS
  // ==========================================

  /**
   * Send typing indicator
   */
  sendTyping(chatId: string, isTyping: boolean) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('typing', { chatId, isTyping });
  }

  /**
   * Listen for typing indicators
   */
  onUserTyping(callback: (data: {
    userId: number;
    isTyping: boolean;
    chatId: string;
  }) => void) {
    if (!this.socket) return;
    this.socket.on('user_typing', callback);
  }

  /**
   * Stop listening for typing indicators
   */
  offUserTyping() {
    if (this.socket) {
      this.socket.off('user_typing');
    }
  }

  // ==========================================
  // READ RECEIPT METHODS
  // ==========================================

  /**
   * Mark messages as read
   */
  markAsRead(chatId: string) {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('mark_read', { chatId });
  }

  /**
   * Listen for read receipts
   */
  onMessagesRead(callback: (data: { userId: number; chatId: string }) => void) {
    if (!this.socket) return;
    this.socket.on('messages_read', callback);
  }

  /**
   * Stop listening for read receipts
   */
  offMessagesRead() {
    if (this.socket) {
      this.socket.off('messages_read');
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();

