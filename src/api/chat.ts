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
    userId?: number;
    businessName: string;
    user: {
      id?: number;
      first_name: string;
      last_name: string;
      profile_picture: string | null;
    };
  };
  customer?: {
    userId?: number;
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
// NEGOTIATION TYPES
// ==========================================

export interface NegotiationOfferPayload {
  job_id: number;
  proposed_price?: number;
  proposed_date?: string; // ISO string
  notes?: string;
}

export type NegotiationAction = 'accept' | 'decline' | 'counter';

export interface NegotiationRespondPayload {
  job_id: number;
  action: NegotiationAction;
  counter_proposed_price?: number;
  counter_proposed_date?: string; // ISO string
  counter_notes?: string;
}

export interface NegotiationHistoryResponse {
  job_id: number;
  current_status: 'awaiting_response' | 'no_active_negotiation';
  current_offer: any;
  original_price: number;
  original_date: string | null;
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
      const response = await apiClient.request<Chat[]>('/chat/customer/chats');
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
      const response = await apiClient.request<Chat[]>('/chat/provider/chats');
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
      const response = await apiClient.request<Chat[]>('/chat/lsm/chats');
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
  async getUserChats(userRole: 'customer' | 'service_provider' | 'local_service_manager' | 'admin'): Promise<Chat[]> {
    if (userRole === 'customer') {
      return this.getCustomerChats();
    } else if (userRole === 'service_provider') {
      return this.getProviderChats();
    } else if (userRole === 'local_service_manager') {
      return this.getLSMChats();
    } else {
      // For admin or other roles, return empty array (they don't use chat system)
      console.log(`Chat not available for user role: ${userRole}`);
      return [];
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

  // ==========================================
  // NEGOTIATION APIS (Job ↔ Chat)
  // ==========================================

  /**
   * Send initial negotiation offer or counter-offer
   * Backend will create a chat message and broadcast via Socket.IO
   */
  async sendNegotiationOffer(
    payload: NegotiationOfferPayload
  ): Promise<{
    success: boolean;
    message: string;
    offer: any;
  }> {
    try {
      const response = await apiClient.request<{
        success: boolean;
        message: string;
        offer: any;
      }>('/chat/negotiation/send-offer', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response;
    } catch (error: any) {
      console.error('Failed to send negotiation offer:', error);
      throw new Error(error?.message || 'Failed to send offer');
    }
  },

  /**
   * Respond to an existing negotiation offer
   * action: accept | decline | counter
   */
  async respondToNegotiationOffer(
    payload: NegotiationRespondPayload
  ): Promise<{
    success: boolean;
    message: string;
    action: NegotiationAction | string;
  }> {
    try {
      const response = await apiClient.request<{
        success: boolean;
        message: string;
        action: NegotiationAction | string;
      }>('/chat/negotiation/respond', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response;
    } catch (error: any) {
      console.error('Failed to respond to negotiation offer:', error);
      throw new Error(error?.message || 'Failed to respond to offer');
    }
  },

  /**
   * Get current negotiation history/state for a job
   */
  async getNegotiationHistory(
    jobId: number
  ): Promise<NegotiationHistoryResponse> {
    try {
      const response = await apiClient.request<NegotiationHistoryResponse>(
        `/chat/negotiation/job/${jobId}/history`
      );
      return response;
    } catch (error: any) {
      console.error('Failed to fetch negotiation history:', error);
      throw new Error(error?.message || 'Failed to load negotiation history');
    }
  },
};

