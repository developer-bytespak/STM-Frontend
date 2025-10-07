import { API_CONFIG, RegisterRequest, RegisterResponse, DocumentUploadResponse } from '@/config/api';

/**
 * API Service for backend communication
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Register a new service provider
 */
export const registerServiceProvider = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
    method: 'POST',
    headers: API_CONFIG.HEADERS,
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || 'Registration failed',
      response.status,
      errorData
    );
  }

  return response.json();
};

/**
 * Upload a document for a service provider
 */
export const uploadDocument = async (
  file: File,
  description: string,
  accessToken: string
): Promise<DocumentUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', description);

  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD_DOCUMENTS}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || 'Document upload failed',
      response.status,
      errorData
    );
  }

  return response.json();
};

/**
 * Handle API errors and return user-friendly messages
 */
export const handleApiError = (error: ApiError): string => {
  switch (error.status) {
    case 409:
      return 'Email already registered. Please login instead.';
    case 400:
      if (error.data?.message?.includes('LSM')) {
        return 'Service not available in your region yet. Please contact support.';
      }
      if (error.data?.message?.includes('price')) {
        return 'Maximum price must be greater than minimum price.';
      }
      if (Array.isArray(error.data?.message)) {
        return error.data.message.join(', ');
      }
      return error.data?.message || 'Invalid data provided.';
    case 401:
      return 'Authentication failed. Please try again.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
};
