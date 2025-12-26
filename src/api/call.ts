import { apiClient } from './index';

export interface VoiceTokenResponse {
  token: string;
}

/**
 * Generate Access Token for Twilio Voice SDK
 * This token allows the browser client to make calls
 */
export const generateVoiceToken = async (): Promise<VoiceTokenResponse> => {
  try {
    const response = await apiClient.request<VoiceTokenResponse>('/api/voice/token', {
      method: 'POST',
    });
    return response;
  } catch (error: any) {
    console.error('❌ Failed to generate voice token:', error);
    throw new Error(error.message || 'Failed to generate voice token');
  }
};

/**
 * Get call status or history (if needed in the future)
 */
export const getCallStatus = async (callSid: string): Promise<any> => {
  try {
    const response = await apiClient.request(`/voice/status/${callSid}`, {
      method: 'GET',
    });
    return response;
  } catch (error: any) {
    console.error('❌ Failed to get call status:', error);
    throw new Error(error.message || 'Failed to get call status');
  }
};
