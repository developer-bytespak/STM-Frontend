import { apiClient } from './index';

// ==========================================
// TYPES
// ==========================================

export interface Message {
  id: string;
  sender_type: 'customer' | 'service_provider' | 'local_service_manager';
  sender_id: number;
  sender_name?: string;
  message: string;
  message_type: 'text' | 'image' | 'document';
  created_at: string;
}

export interface Chat {
  id: string;
  job: {
    id: number;
    service: {
      name: string;
      category: string;
    };
    status: string;
  } | null;
  provider?: {
    id: number;
    businessName: string;
    user: {
      first_name: string;
      last_name: string;
      profile_picture: string | null;
    };
  };
  customer?: {
    name: string;
    profilePicture: string | null;
  };
  localServiceManager?: {
    id: number;
    user: {
      first_name: string;
      last_name: string;
    };
  };
  lsm_invited?: boolean;
  lsm_joined?: boolean;
  lsm_joined_at?: string | null;
  lastMessage: Message | null;
  created_at: string;
}

export interface ChatMessagesResponse {
  chatId: string;
  messages: Message[];
}

// ==========================================
// API FUNCTIONS
// ==========================================

export const chatApi = {
  /**
   * Get all chats for the current customer
   */
  async getCustomerChats(): Promise<Chat[]> {
    try {
      const response = await apiClient.request<Chat[]>('/customer/chats');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch customer chats:', error);
      throw new Error(error?.message || 'Failed to load chats');
    }
  },

  /**
   * Get all chats for the current provider
   */
  async getProviderChats(): Promise<Chat[]> {
    try {
      const response = await apiClient.request<Chat[]>('/provider/chats');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch provider chats:', error);
      throw new Error(error?.message || 'Failed to load chats');
    }
  },

  /**
   * Get all chats for the current LSM (Local Service Manager)
   */
  async getLSMChats(): Promise<Chat[]> {
    try {
      const response = await apiClient.request<Chat[]>('/lsm/chats');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch LSM chats:', error);
      throw new Error(error?.message || 'Failed to load chats');
    }
  },

  /**
   * Get message history for a specific chat
   * Used when opening a chat to load past messages
   */
  async getChatMessages(chatId: string): Promise<ChatMessagesResponse> {
    try {
      const response = await apiClient.request<ChatMessagesResponse>(
        `/chat/${chatId}/messages`
      );
      return response;
    } catch (error: any) {
      console.error('Failed to fetch chat messages:', error);
      throw new Error(error?.message || 'Failed to load messages');
    }
  },

  /**
   * Load all chats based on user role
   * Automatically determines whether to call customer, provider, or LSM endpoint
   */
  async getUserChats(userRole: 'customer' | 'service_provider' | 'local_service_manager'): Promise<Chat[]> {
    if (userRole === 'customer') {
      return this.getCustomerChats();
    } else if (userRole === 'service_provider') {
      return this.getProviderChats();
    } else if (userRole === 'local_service_manager') {
      return this.getLSMChats();
    } else {
      throw new Error('Invalid user role for chat');
    }
  },

  /**
   * Upload files for chat message
   * Returns URLs of uploaded files
   */
  async uploadChatFiles(files: File[]): Promise<{ urls: string[] }> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await apiClient.upload<{ urls: string[] }>(
        '/chat/upload-files',
        formData
      );
      return response;
    } catch (error: any) {
      console.error('Failed to upload chat files:', error);
      throw new Error(error?.message || 'Failed to upload files');
    }
  },
};

