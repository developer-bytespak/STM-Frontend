/**
 * Office Booking API Service
 * Handles all office space and booking related API calls
 */

import { apiClient } from './index';
import { OfficeSpace, OfficeBooking, CreateOfficeSpaceDto, UpdateOfficeSpaceDto } from '@/types/office';

// Office Space API
export const officeSpaceApi = {
  // Admin Office Management
  async createOffice(data: CreateOfficeSpaceDto): Promise<OfficeSpace> {
    console.log('Creating office with data:', data);
    try {
      const result = await apiClient.request<OfficeSpace>('/admin/offices', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log('Office creation result:', result);
      return result;
    } catch (error: any) {
      console.error('Office creation error:', error);
      console.error('Error details:', error?.response || error?.message);
      throw error;
    }
  },

  async getAllOffices(): Promise<OfficeSpace[]> {
    try {
      console.log('Fetching admin offices...');
      const response = await apiClient.request<{ success: boolean; offices: OfficeSpace[]; total: number }>('/admin/offices');
      console.log('Admin offices response:', response);
      return response.offices || [];
    } catch (error: any) {
      console.error('Error fetching admin offices:', error);
      console.error('Error details:', error?.response || error?.message);
      return [];
    }
  },

  async getOfficeById(id: string): Promise<OfficeSpace> {
    return apiClient.request<OfficeSpace>(`/admin/offices/${id}`);
  },

  async updateOffice(id: string, data: UpdateOfficeSpaceDto): Promise<OfficeSpace> {
    console.log('Updating office with ID:', id);
    console.log('Update data:', data);
    try {
      const result = await apiClient.request<OfficeSpace>(`/admin/offices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      console.log('Office update result:', result);
      return result;
    } catch (error: any) {
      console.error('Office update error:', error);
      console.error('Error details:', error?.response || error?.message);
      throw error;
    }
  },

  async deleteOffice(id: string): Promise<void> {
    return apiClient.request<void>(`/admin/offices/${id}`, {
      method: 'DELETE',
    });
  },

  // Provider Office Browsing
  async getAvailableOffices(): Promise<OfficeSpace[]> {
    try {
      const response = await apiClient.request<{ success: boolean; offices: OfficeSpace[] }>('/provider/offices');
      console.log('Provider offices response:', response);
      return response.offices || [];
    } catch (error) {
      console.error('Error fetching provider offices:', error);
      return [];
    }
  },

  // Get office availability for date picker
  async getOfficeAvailability(officeId: string): Promise<{
    success: boolean;
    officeId: string;
    unavailableDates: Array<{
      start: string;
      end: string;
      status: string;
    }>;
    totalBookings: number;
  }> {
    try {
      console.log('Fetching availability for office:', officeId);
      const response = await apiClient.request<{
        success: boolean;
        officeId: string;
        unavailableDates: Array<{
          start: string;
          end: string;
          status: string;
        }>;
        totalBookings: number;
      }>(`/provider/offices/${officeId}/availability`);
      console.log('Office availability response:', response);
      return response;
    } catch (error: any) {
      console.error('Error fetching office availability:', error);
      console.error('Error details:', error?.response || error?.message);
      return {
        success: false,
        officeId,
        unavailableDates: [],
        totalBookings: 0
      };
    }
  },

  async getOfficeDetails(id: string): Promise<OfficeSpace> {
    return apiClient.request<OfficeSpace>(`/provider/offices/${id}`);
  },
};

// Booking API
export const bookingApi = {
  // Admin Booking Management
  async getAllBookings(): Promise<OfficeBooking[]> {
    return apiClient.request<OfficeBooking[]>('/admin/office-bookings');
  },

  async confirmBooking(id: string): Promise<OfficeBooking> {
    return apiClient.request<OfficeBooking>(`/admin/office-bookings/${id}/confirm`, {
      method: 'PUT',
    });
  },

  async completeBooking(id: string): Promise<OfficeBooking> {
    return apiClient.request<OfficeBooking>(`/admin/office-bookings/${id}/complete`, {
      method: 'PUT',
    });
  },

  // Provider Booking Management
  async createBooking(data: {
    officeSpaceId: string;
    startDate: string;
    endDate: string;
    specialRequests?: string;
  }): Promise<OfficeBooking> {
    console.log('Creating booking with data:', data);
    try {
      const result = await apiClient.request<OfficeBooking>('/provider/office-bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log('Booking created successfully:', result);
      return result;
    } catch (error: any) {
      console.error('Booking creation error:', error);
      console.error('Error details:', error?.response || error?.message);
      throw error;
    }
  },

  async getMyBookings(): Promise<{ success: boolean; bookings: OfficeBooking[] }> {
    const response = await apiClient.request<{ success: boolean; bookings: any[] }>('/provider/office-bookings');
    return {
      success: response.success,
      bookings: response.bookings.map(transformBooking)
    };
  },

  async getBookingById(id: string): Promise<OfficeBooking> {
    const response = await apiClient.request<any>(`/provider/office-bookings/${id}`);
    return transformBooking(response);
  },
};

// Admin booking API functions
export const adminBookingApi = {
  async getAllBookings(): Promise<{ success: boolean; bookings: OfficeBooking[]; total: number }> {
    const response = await apiClient.request<{ success: boolean; bookings: any[]; total: number }>('/admin/office-bookings');
    return {
      success: response.success,
      bookings: response.bookings.map(transformBooking),
      total: response.total
    };
  },

  async confirmBooking(id: string): Promise<{ success: boolean; message: string; booking: OfficeBooking }> {
    const response = await apiClient.request<{ success: boolean; message: string; booking: any }>(`/admin/office-bookings/${id}/confirm`, {
      method: 'PUT'
    });
    return {
      success: response.success,
      message: response.message,
      booking: transformBooking(response.booking)
    };
  },

  async completeBooking(id: string): Promise<{ success: boolean; message: string; booking: OfficeBooking }> {
    const response = await apiClient.request<{ success: boolean; message: string; booking: any }>(`/admin/office-bookings/${id}/complete`, {
      method: 'PUT'
    });
    return {
      success: response.success,
      message: response.message,
      booking: transformBooking(response.booking)
    };
  },
};

// Transform backend data to frontend format
export const transformOfficeSpace = (backendOffice: any): OfficeSpace => {
  console.log('Transforming office data:', backendOffice);
  
  return {
    id: backendOffice.id,
    name: backendOffice.name,
    type: backendOffice.type,
    description: backendOffice.description,
    location: {
      address: backendOffice.address,
      city: backendOffice.city,
      state: backendOffice.state,
      zipCode: backendOffice.zipCode, // Backend returns zipCode, not zip_code
    },
    capacity: Number(backendOffice.capacity) || 0,
    area: Number(backendOffice.area) || 0, // Backend returns area, not area_sqft
    pricing: {
      daily: Number(backendOffice.dailyPrice) || 0, // Backend returns dailyPrice, not daily_price
    },
    amenities: [], // MVP - amenities are commented out
    images: backendOffice.images || [],
    availability: backendOffice.availability || {},
    status: backendOffice.status,
    totalBookings: Number(backendOffice.totalBookings) || 0, // Backend returns totalBookings, not total_bookings
    rating: Number(backendOffice.rating) || 0,
    reviews: Number(backendOffice.reviewsCount) || 0, // Backend returns reviewsCount, not reviews_count
    createdAt: backendOffice.createdAt, // Backend returns createdAt, not created_at
    updatedAt: backendOffice.updatedAt, // Backend returns updatedAt, not updated_at
  };
};

export const transformBooking = (backendBooking: any): OfficeBooking => {
  return {
    id: backendBooking.id,
    officeId: backendBooking.officeSpaceId,
    officeName: backendBooking.officeName,
    providerId: backendBooking.providerId.toString(),
    providerName: backendBooking.providerName,
    providerEmail: backendBooking.providerEmail,
    startDate: backendBooking.startDate,
    endDate: backendBooking.endDate,
    duration: backendBooking.duration,
    durationType: backendBooking.durationType,
    totalAmount: parseFloat(backendBooking.totalAmount),
    status: backendBooking.status,
    paymentStatus: backendBooking.paymentStatus,
    paymentMethod: backendBooking.paymentMethod,
    transactionId: backendBooking.transactionId,
    specialRequests: backendBooking.specialRequests,
    createdAt: backendBooking.createdAt,
    updatedAt: backendBooking.updatedAt,
  };
};

// Transform frontend data to backend format
export const transformCreateOfficeData = (frontendData: CreateOfficeSpaceDto) => {
  return {
    name: frontendData.name,
    description: frontendData.description,
    type: frontendData.type || 'private_office',
    location: {
      address: frontendData.location.address,
      city: frontendData.location.city,
      state: frontendData.location.state,
      zipCode: String(frontendData.location.zipCode), // Convert to string
    },
    capacity: frontendData.capacity,
    area: frontendData.area,
    pricing: {
      daily: frontendData.pricing.daily,
    },
    availability: frontendData.availability,
    images: frontendData.images || [],
  };
};

export const transformUpdateOfficeData = (frontendData: UpdateOfficeSpaceDto) => {
  const updateData: any = {};
  
  if (frontendData.name !== undefined) updateData.name = frontendData.name;
  if (frontendData.description !== undefined) updateData.description = frontendData.description;
  if (frontendData.capacity !== undefined) updateData.capacity = frontendData.capacity;
  if (frontendData.area !== undefined) updateData.area = frontendData.area;
  if (frontendData.pricing?.daily !== undefined) {
    updateData.pricing = { daily: frontendData.pricing.daily };
  }
  if (frontendData.status !== undefined) updateData.status = frontendData.status;
  if (frontendData.availability !== undefined) updateData.availability = frontendData.availability;
  if (frontendData.images !== undefined) updateData.images = frontendData.images;
  if (frontendData.amenities !== undefined) {
    // Transform amenities from objects to strings if needed
    updateData.amenities = Array.isArray(frontendData.amenities) 
      ? frontendData.amenities.map((a: any) => typeof a === 'string' ? a : a.name || a.id)
      : frontendData.amenities;
  }
  
  // Handle location updates with proper zipCode string conversion
  if (frontendData.location !== undefined) {
    updateData.location = {
      address: frontendData.location.address,
      city: frontendData.location.city,
      state: frontendData.location.state,
      zipCode: String(frontendData.location.zipCode), // Convert to string
    };
  }
  
  return updateData;
};
