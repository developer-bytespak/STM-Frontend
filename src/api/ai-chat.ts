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

export interface UploadImagesResponse {
  imageUrls: string[];
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
  async generateSummary(
    sessionId: string,
    collectedData?: {
      service: string | null;
      zipcode: string | null;
      budget: string | null;
      requirements: string | null;
    }
  ): Promise<{ summary: string }> {
    try {
      const response = await apiClient.request<{ summary: string }>(
        `/customer/ai-chat/sessions/${sessionId}/summary`,
        {
          method: 'POST',
          body: collectedData ? JSON.stringify(collectedData) : undefined,
        }
      );
      return response;
    } catch (error: any) {
      console.error('Failed to generate summary:', error);
      throw new Error(error?.message || 'Failed to generate summary');
    }
  }

  /**
   * Extract structured data from conversation using AI
   */
  async extractData(sessionId: string): Promise<{
    service: string | null;
    zipcode: string | null;
    budget: string | null;
    requirements: string | null;
  }> {
    try {
      console.log(`🔍 [API] Calling extraction endpoint for session: ${sessionId}`);
      const response = await apiClient.request<{
        service: string | null;
        zipcode: string | null;
        budget: string | null;
        requirements: string | null;
      }>(
        `/customer/ai-chat/sessions/${sessionId}/extract`,
        {
          method: 'POST',
        }
      );
      console.log(`✅ [API] Extraction API response:`, response);
      return response;
    } catch (error: any) {
      console.error('❌ [API] Failed to extract data:', error);
      console.error('   Error status:', error?.status);
      console.error('   Error message:', error?.message);
      console.error('   Full error:', error);
      // Return null values instead of throwing to prevent disruption
      return {
        service: null,
        zipcode: null,
        budget: null,
        requirements: null,
      };
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
   * Get actual price range for a service from provider data
   */
  async getServicePriceRange(serviceName: string): Promise<{
    serviceName: string;
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    providerCount: number;
  }> {
    try {
      const response = await apiClient.request<{
        serviceName: string;
        minPrice: number;
        maxPrice: number;
        avgPrice: number;
        providerCount: number;
      }>(
        `/customer/ai-chat/services/${encodeURIComponent(serviceName)}/price-range`
      );
      return response;
    } catch (error: any) {
      console.error('Failed to get service price range:', error);
      // Return default on error
      return {
        serviceName,
        minPrice: 50,
        maxPrice: 500,
        avgPrice: 250,
        providerCount: 0,
      };
    }
  }

  /**
   * Upload images for AI chat job request
   */
  async uploadImages(files: File[]): Promise<UploadImagesResponse> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await apiClient.upload<UploadImagesResponse>(
        '/jobs/images/upload',
        formData
      );
      return response;
    } catch (error: any) {
      console.error('Failed to upload images:', error);
      throw new Error(error?.message || 'Failed to upload images');
    }
  }

  /**
   * Create a chat from AI flow with summary injection
   */
  async createChatFromAI(
    providerId: number,
    aiSessionId: string,
    images?: string[]
  ): Promise<CreateChatFromAIResponse> {
    try {
      const response = await apiClient.request<CreateChatFromAIResponse>(
        '/customer/ai-chat/chats/create',
        {
          method: 'POST',
          body: JSON.stringify({ providerId, aiSessionId, images }),
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

