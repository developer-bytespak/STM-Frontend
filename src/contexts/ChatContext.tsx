'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { socketService } from '@/lib/socketService';
import { chatApi } from '@/api/chat';
import { useAuth } from '@/hooks/useAuth';

// Import debug tools (only in development)
if (process.env.NODE_ENV === 'development') {
  import('@/lib/socketDebug');
}

export interface Message {
  id: string;
  senderId: string | number;
  senderName: string;
  senderRole: 'customer' | 'service_provider' | 'local_service_manager';
  content: string;
  timestamp: Date;
  type: 'text' | 'form-data' | 'file';
  formData?: BookingFormData;
  files?: {
    name: string;
    size: number;
    type: string;
    url: string;
  }[];
}

export interface BookingFormData {
  serviceType: string;
  description: string;
  dimensions?: string;
  budget: string;
  preferredDate?: string;
  urgency?: string;
  additionalDetails?: string;
}

export interface ChatConversation {
  id: string;  // UUID from backend
  providerId: string | number;
  providerName: string;
  customerId: string | number;
  customerName: string;
  jobId?: number;  // Link to backend job
  lsmId?: string | number;
  lsmName?: string;
  messages: Message[];
  isOpen: boolean;
  isMinimized: boolean;
  createdAt: Date;
  isLoadingHistory?: boolean; // Track if we're loading message history
}

interface ChatContextType {
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  createConversation: (providerId: string | number, providerName: string, formData: BookingFormData, jobId?: number, chatId?: string) => void;
  openConversation: (conversationId: string) => void;
  openConversationByJobId: (jobId: number) => boolean;
  closeConversation: () => void;
  minimizeConversation: () => void;
  minimizeToCompact: () => void;
  maximizeConversation: () => void;
  sendMessage: (content: string, files?: File[]) => void;
  addLSMToChat: (lsmId: string, lsmName: string) => void;
  isPreviewMinimized: boolean;
  isSocketConnected: boolean; // Track socket connection status
  connectionError: string | null; // Track connection errors
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [isPreviewMinimized, setIsPreviewMinimized] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // ==========================================
  // SOCKET.IO CONNECTION SETUP
  // ==========================================

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // User not authenticated, don't connect socket
      socketService.disconnect();
      setIsSocketConnected(false);
      setConnectionError(null);
      return;
    }

    console.log('🔌 Initializing socket connection for user:', user.name);
    
    // Connect to socket server
    const socket = socketService.connect();
    
    if (!socket) {
      setConnectionError('Failed to initialize socket connection');
      return;
    }

    // Update connection status
    setIsSocketConnected(socket.connected);

    // Listen for connection status changes
    socket.on('connect', () => {
      console.log('✅ Socket connected in ChatContext');
      setIsSocketConnected(true);
      setConnectionError(null);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('❌ Socket disconnected in ChatContext:', reason);
      setIsSocketConnected(false);
      
      if (reason === 'io server disconnect') {
        setConnectionError('Server disconnected. Please refresh the page.');
      } else {
        setConnectionError('Connection lost. Reconnecting...');
      }
    });

    socket.on('connect_error', (error: Error) => {
      console.error('❌ Socket connection error:', error.message);
      setConnectionError(`Connection error: ${error.message}`);
    });

    // Listen for new messages from all chats
    socketService.onNewMessage((messageData) => {
      console.log('📨 New message received:', messageData);
      handleIncomingMessage(messageData);
    });

    // Listen for typing indicators
    socketService.onUserTyping((data) => {
      console.log('⌨️ User typing:', data);
      // You can add typing indicator UI here if needed
    });

    // Cleanup on unmount or user change
    return () => {
      socketService.offNewMessage();
      socketService.offUserTyping();
      // Don't disconnect socket here - keep it alive for other components
    };
  }, [isAuthenticated, user]);

  // ==========================================
  // JOIN/LEAVE CHAT ROOMS
  // ==========================================

  // Join chat room when active conversation changes
  useEffect(() => {
    if (activeConversation && isSocketConnected) {
      console.log('📥 Joining chat room:', activeConversation.id);
      socketService.joinChat(activeConversation.id);

      // Load message history if not already loaded
      if (!activeConversation.isLoadingHistory && activeConversation.messages.length === 0) {
        loadMessageHistory(activeConversation.id);
      }

      // Leave room when conversation changes or closes
      return () => {
        console.log('📤 Leaving chat room:', activeConversation.id);
        socketService.leaveChat(activeConversation.id);
      };
    }
  }, [activeConversation?.id, isSocketConnected]);

  // ==========================================
  // HANDLE INCOMING MESSAGES
  // ==========================================

  const handleIncomingMessage = (messageData: {
    id: string;
    chatId: string;
    sender_type: 'customer' | 'service_provider' | 'local_service_manager';
    sender_id: number;
    sender_name?: string;
    message: string;
    message_type: 'text' | 'image' | 'document';
    created_at: string;
  }) => {
    // Convert backend message to frontend Message format
    const newMessage: Message = {
      id: messageData.id,
      senderId: messageData.sender_id,
      senderName: messageData.sender_name || getSenderName(messageData.sender_id, messageData.sender_type),
      senderRole: messageData.sender_type,
      content: messageData.message,
      timestamp: new Date(messageData.created_at),
      type: messageData.message_type as 'text' | 'file',
    };

    // Update conversations list
    setConversations(prev =>
      prev.map(conv =>
        conv.id === messageData.chatId
          ? { ...conv, messages: [...conv.messages, newMessage] }
          : conv
      )
    );

    // Update active conversation if it's the same chat
    setActiveConversation(prev =>
      prev?.id === messageData.chatId
        ? { ...prev, messages: [...prev.messages, newMessage] }
        : prev
    );
  };

  // Helper function to get sender name (you can enhance this to fetch from backend)
  const getSenderName = (senderId: number, senderType: string): string => {
    // If it's current user
    if (user && Number(user.id) === senderId) {
      return user.name;
    }

    // Try to find sender name from conversations
    for (const conv of conversations) {
      if (senderType === 'customer' && Number(conv.customerId) === senderId) {
        return conv.customerName;
      } else if (senderType === 'service_provider' && Number(conv.providerId) === senderId) {
        return conv.providerName;
      } else if (senderType === 'local_service_manager' && Number(conv.lsmId) === senderId) {
        return conv.lsmName || 'Local Service Manager';
      }
    }

    // Fallback
    return 'Unknown User';
  };

  // ==========================================
  // LOAD MESSAGE HISTORY
  // ==========================================

  const loadMessageHistory = async (chatId: string) => {
    try {
      console.log('📜 Loading message history for chat:', chatId);
      
      // Mark as loading
      setConversations(prev =>
        prev.map(conv =>
          conv.id === chatId ? { ...conv, isLoadingHistory: true } : conv
        )
      );

      // Fetch messages from backend
      const response = await chatApi.getChatMessages(chatId);
      
      // Convert backend messages to frontend format
      const messages: Message[] = response.messages.map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        senderName: msg.sender_name || getSenderName(msg.sender_id, msg.sender_type),
        senderRole: msg.sender_type,
        content: msg.message,
        timestamp: new Date(msg.created_at),
        type: msg.message_type as 'text' | 'file',
      }));

      // Update conversations with loaded messages
      setConversations(prev =>
        prev.map(conv =>
          conv.id === chatId
            ? { ...conv, messages, isLoadingHistory: false }
            : conv
        )
      );

      // Update active conversation
      setActiveConversation(prev =>
        prev?.id === chatId
          ? { ...prev, messages, isLoadingHistory: false }
          : prev
      );

      console.log('✅ Message history loaded:', messages.length, 'messages');
    } catch (error) {
      console.error('❌ Failed to load message history:', error);
      
      // Mark loading as done even on error
      setConversations(prev =>
        prev.map(conv =>
          conv.id === chatId ? { ...conv, isLoadingHistory: false } : conv
        )
      );
    }
  };

  // ==========================================
  // LEGACY LOCALSTORAGE (Optional - for offline viewing)
  // ==========================================

  // Load conversations from localStorage on mount (backup)
  useEffect(() => {
    const stored = localStorage.getItem('chatConversations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const withDates = parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        // Only use localStorage if no conversations loaded from backend
        if (conversations.length === 0) {
          setConversations(withDates);
        }
      } catch (error) {
        console.error('Failed to parse localStorage conversations:', error);
      }
    }
  }, []);

  // Save conversations to localStorage (backup)
  useEffect(() => {
    if (conversations.length > 0) {
      try {
        localStorage.setItem('chatConversations', JSON.stringify(conversations));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }
  }, [conversations]);

  // ==========================================
  // CREATE CONVERSATION
  // ==========================================

  const createConversation = (
    providerId: string | number,
    providerName: string,
    formData: BookingFormData,
    jobId?: number,
    chatId?: string // Optional: If chat already exists from backend
  ) => {
    if (!user) {
      console.error('Cannot create conversation: User not authenticated');
      return;
    }

    // Use provided chatId or create a temporary one (will be replaced by backend UUID)
    const conversationId = chatId || `temp-${Date.now()}`;
    const customerId = user.id;
    const customerName = user.name;

    console.log('💬 Creating conversation:', {
      conversationId,
      providerId,
      providerName,
      jobId,
    });

    // Check if conversation already exists
    const existingConversation = conversations.find(conv => conv.id === conversationId);
    
    if (existingConversation) {
      console.log('📂 Opening existing conversation:', conversationId);
      // Just open the existing conversation
      setActiveConversation(existingConversation);
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, isOpen: true, isMinimized: false } : conv
      ));
      return;
    }

    // Create new conversation with empty messages (will be loaded from backend)
    const newConversation: ChatConversation = {
      id: conversationId,
      providerId,
      providerName,
      customerId,
      customerName,
      jobId,
      messages: [], // Start with empty, messages will be loaded from backend
      isOpen: true,
      isMinimized: false,
      createdAt: new Date(),
    };

    setConversations(prev => [...prev, newConversation]);
    setActiveConversation(newConversation);

    // If socket is connected and we have a real chatId, join the room
    // Message history will be loaded automatically by the join effect
    if (isSocketConnected && chatId) {
      socketService.joinChat(chatId);
    }
  };

  const formatFormDataMessage = (formData: BookingFormData): string => {
    let message = `**Service Request Details**\n\n`;
    message += `Service Type: ${formData.serviceType}\n`;
    message += `Description: ${formData.description}\n`;
    
    if (formData.dimensions) {
      message += `Dimensions/Size: ${formData.dimensions}\n`;
    }
    
    message += `Budget: $${formData.budget}\n`;
    
    if (formData.preferredDate) {
      message += `Preferred Date: ${formData.preferredDate}\n`;
    }
    
    if (formData.urgency) {
      message += `Urgency: ${formData.urgency}\n`;
    }
    
    if (formData.additionalDetails) {
      message += `Additional Details: ${formData.additionalDetails}`;
    }

    return message;
  };

  const openConversation = (conversationId: string, reloadMessages = true) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setActiveConversation(conversation);
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, isOpen: true, isMinimized: false } : conv
      ));
      
      // Reload message history to get latest messages (especially when opened from notification)
      if (reloadMessages && isSocketConnected) {
        console.log('🔄 Reloading messages for chat:', conversationId);
        loadMessageHistory(conversationId);
      }
    }
  };

  const openConversationByJobId = (jobId: number): boolean => {
    const conversation = conversations.find(conv => conv.jobId === jobId);
    if (conversation) {
      setActiveConversation(conversation);
      setConversations(prev => prev.map(conv => 
        conv.jobId === jobId ? { ...conv, isOpen: true, isMinimized: false } : conv
      ));
      setIsPreviewMinimized(false);
      return true;
    }
    return false;
  };

  const closeConversation = () => {
    if (activeConversation) {
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id ? { ...conv, isOpen: false } : conv
      ));
    }
    setActiveConversation(null);
  };

  const minimizeConversation = () => {
    if (activeConversation) {
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id ? { ...conv, isMinimized: false } : conv
      ));
      setActiveConversation(prev => prev ? { ...prev, isMinimized: false } : null);
      setIsPreviewMinimized(true);
    }
  };

  const minimizeToCompact = () => {
    if (activeConversation) {
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id ? { ...conv, isMinimized: true } : conv
      ));
      setActiveConversation(prev => prev ? { ...prev, isMinimized: true } : null);
      setIsPreviewMinimized(false);
    }
  };

  const maximizeConversation = () => {
    if (activeConversation) {
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id ? { ...conv, isMinimized: false } : conv
      ));
      setActiveConversation(prev => prev ? { ...prev, isMinimized: false } : null);
      setIsPreviewMinimized(false);
    }
  };

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage = (content: string, files?: File[]) => {
    if (!activeConversation) {
      console.error('Cannot send message: No active conversation');
      return;
    }
    
    if (!content.trim() && (!files || files.length === 0)) {
      console.error('Cannot send empty message');
      return;
    }

    if (!user) {
      console.error('Cannot send message: User not authenticated');
      return;
    }

    if (!isSocketConnected) {
      console.error('Cannot send message: Socket not connected');
      alert('Connection lost. Please check your internet connection.');
      return;
    }

    const customerId = user.id;
    const customerName = user.name;

    // Handle file uploads (you'll need to implement file upload to server first)
    if (files && files.length > 0) {
      console.log('📎 File upload not yet implemented - sending as text for now');
      // TODO: Upload files to server, get URLs, then send message with file URLs
      // For now, just send as text message
      
      const fileMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: customerId,
        senderName: customerName,
        senderRole: 'customer',
        content: content.trim() || 'Sent file(s)',
        timestamp: new Date(),
        type: 'file',
        files: files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
        })),
      };

      // Optimistically add to UI
      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversation.id
            ? { ...conv, messages: [...conv.messages, fileMessage] }
            : conv
        )
      );

      setActiveConversation(prev =>
        prev ? { ...prev, messages: [...prev.messages, fileMessage] } : null
      );

      // TODO: Implement actual file upload and sending via socket
      return;
    }

    // Send text message via Socket.IO
    try {
      console.log('📤 Sending message via socket:', content.substring(0, 50));
      
      // Optimistically add message to UI
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: customerId,
        senderName: customerName,
        senderRole: 'customer',
        content: content.trim(),
        timestamp: new Date(),
        type: 'text',
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversation.id
            ? { ...conv, messages: [...conv.messages, optimisticMessage] }
            : conv
        )
      );

      setActiveConversation(prev =>
        prev
          ? { ...prev, messages: [...prev.messages, optimisticMessage] }
          : null
      );

      // Send via socket
      socketService.sendMessage(activeConversation.id, content.trim(), 'text');

      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      alert('Failed to send message. Please try again.');
      
      // TODO: Remove optimistic message if send fails
      // Or add a "failed" status to messages and allow retry
    }
  };

  const addLSMToChat = (lsmId: string, lsmName: string) => {
    if (!activeConversation) return;

    const systemMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      senderRole: 'local_service_manager',
      content: `${lsmName} was added`,
      timestamp: new Date(),
      type: 'text'
    };

    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation.id 
        ? { 
            ...conv, 
            lsmId, 
            lsmName,
            messages: [...conv.messages, systemMessage] 
          }
        : conv
    ));

    // Update active conversation
    setActiveConversation(prev => prev ? {
      ...prev,
      lsmId,
      lsmName,
      messages: [...prev.messages, systemMessage]
    } : null);
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        createConversation,
        openConversation,
        openConversationByJobId,
        closeConversation,
        minimizeConversation,
        minimizeToCompact,
        maximizeConversation,
        sendMessage,
        addLSMToChat,
        isPreviewMinimized,
        isSocketConnected,
        connectionError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}