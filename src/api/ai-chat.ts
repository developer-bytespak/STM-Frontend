/**
 * AI Chat API Service Layer
 * Handles all AI sales assistant chat API calls
 */

import { apiClient } from './index';

// ==================== TYPE DEFINITIONS ====================

export interface AiChatSession {
  id: string;
  sessionId: string;
  summary?: string;
  isActive: boolean;
  createdAt: string;
  lastActive?: string;
  messages?: AiChatMessage[];
  messageCount?: number;
}

export interface AiChatMessage {
  id: string;
  senderType: 'user' | 'assistant';
  message: string;
  createdAt: string;
}

export interface AiChatResponse {
  userMessage: AiChatMessage;
  aiMessage: AiChatMessage;
}

export interface RecommendedProvider {
  id: number;
  businessName?: string;
  ownerName: string;
  rating: number;
  totalJobs: number;
  minPrice?: number;
  maxPrice?: number;
  location: string;
  serviceAreas: string[];
  experience: number;
  logoUrl?: string;
  bannerUrl?: string;
  slug?: string;
}

export interface ProviderRecommendationResult {
  providers: RecommendedProvider[];
  count: number;
  service: string;
  location: string;
}

export interface CreateChatFromAIResponse {
  chatId: string;
  message: string;
}

// ==================== AI CHAT API CLASS ====================

class AiChatApi {
  /**
   * Create a new AI chat session
   */
  async createSession(): Promise<AiChatSession> {
    try {
      const response = await apiClient.request<AiChatSession>(
        '/customer/ai-chat/sessions',
        {
          method: 'POST',
        }
      );
      return response;
    } catch (error: any) {
      console.error('Failed to create AI chat session:', error);
      throw new Error(error?.message || 'Failed to create session');
    }
  }

  /**
   * Get active AI chat session
   */
  async getActiveSession(): Promise<AiChatSession | null> {
    try {
      const response = await apiClient.request<AiChatSession>(
        '/customer/ai-chat/sessions/active'
      );
      return response;
    } catch (error: any) {
      // 404 means no active session, which is fine
      if (error?.status === 404) {
        return null;
      }
      console.error('Failed to get active session:', error);
      throw new Error(error?.message || 'Failed to get active session');
    }
  }

  /**
   * Get AI chat session history
   */
  async getSessionHistory(): Promise<AiChatSession[]> {
    try {
      const response = await apiClient.request<AiChatSession[]>(
        '/customer/ai-chat/sessions'
      );
      return response;
    } catch (error: any) {
      console.error('Failed to get session history:', error);
      throw new Error(error?.message || 'Failed to get session history');
    }
  }

  /**
   * Get a specific AI chat session by ID
   */
  async getSessionById(sessionId: string): Promise<AiChatSession> {
    try {
      const response = await apiClient.request<AiChatSession>(
        `/customer/ai-chat/sessions/${sessionId}`
      );
      return response;
    } catch (error: any) {
      console.error('Failed to get session by ID:', error);
      throw new Error(error?.message || 'Failed to get session');
    }
  }



  /**
   * Send a message to AI assistant
   */
  async sendMessage(
    sessionId: string,
    message: string
  ): Promise<AiChatResponse> {
    try {
      const response = await apiClient.request<AiChatResponse>(
        `/customer/ai-chat/sessions/${sessionId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ message }),
        }
      );
      return response;
    } catch (error: any) {
      console.error('Failed to send message:', error);
      throw new Error(error?.message || 'Failed to send message');
    }
  }

  /**
   * Generate summary from conversation
   */
  async generateSummary(sessionId: string): Promise<{ summary: string }> {
    try {
      const response = await apiClient.request<{ summary: string }>(
        `/customer/ai-chat/sessions/${sessionId}/summary`,
        {
          method: 'POST',
        }
      );
      return response;
    } catch (error: any) {
      console.error('Failed to generate summary:', error);
      throw new Error(error?.message || 'Failed to generate summary');
    }
  }

  /**
   * End an AI chat session
   */
  async endSession(sessionId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.request<{ message: string }>(
        `/customer/ai-chat/sessions/${sessionId}/end`,
        {
          method: 'POST',
        }
      );
      return response;
    } catch (error: any) {
      console.error('Failed to end session:', error);
      throw new Error(error?.message || 'Failed to end session');
    }
  }

  /**
   * Get recommended providers (top 3)
   */
  async getRecommendedProviders(
    service: string,
    zipcode: string
  ): Promise<ProviderRecommendationResult> {
    try {
      const response = await apiClient.request<ProviderRecommendationResult>(
        '/customer/ai-chat/providers/recommend',
        {
          method: 'POST',
          body: JSON.stringify({ service, zipcode }),
        }
      );
      return response;
    } catch (error: any) {
      console.error('Failed to get recommended providers:', error);
      throw new Error(error?.message || 'Failed to get recommended providers');
    }
  }

  /**
   * Create a chat from AI flow with summary injection
   */
  async createChatFromAI(
    providerId: number,
    aiSessionId: string
  ): Promise<CreateChatFromAIResponse> {
    try {
      const response = await apiClient.request<CreateChatFromAIResponse>(
        '/customer/ai-chat/chats/create',
        {
          method: 'POST',
          body: JSON.stringify({ providerId, aiSessionId }),
        }
      );
      return response;
    } catch (error: any) {
      console.error('Failed to create chat from AI:', error);
      throw new Error(error?.message || 'Failed to create chat');
    }
  }
}

export const aiChatApi = new AiChatApi();

