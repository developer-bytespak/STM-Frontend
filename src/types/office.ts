// Office Space Types

export type OfficeSpaceType = 'private_office' | 'shared_desk' | 'meeting_room' | 'conference_room' | 'coworking_space';
export type OfficeStatus = 'available' | 'occupied' | 'maintenance' | 'booked';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface OfficeSpace {
  id: string;
  name: string;
  type: OfficeSpaceType;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  capacity: number; // Number of people
  area: number; // Square feet
  pricing: {
    hourly?: number;
    daily: number;
    weekly?: number;
    monthly?: number;
  };
  amenities: Amenity[];
  images: string[];
  availability: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  status: OfficeStatus;
  totalBookings: number;
  rating: number;
  reviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface OfficeBooking {
  id: string;
  officeId: string;
  officeName: string;
  providerId: string;
  providerName: string;
  providerEmail: string;
  startDate: string;
  endDate: string;
  duration: number; // in hours or days
  durationType: 'hourly' | 'daily' | 'weekly' | 'monthly';
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfficeAnalytics {
  totalSpaces: number;
  availableSpaces: number;
  occupiedSpaces: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageBookingDuration: number;
  occupancyRate: number; // Percentage
  popularSpaceType: OfficeSpaceType;
  topBookedSpaces: {
    officeId: string;
    officeName: string;
    bookings: number;
    revenue: number;
  }[];
  revenueBySpaceType: {
    type: OfficeSpaceType;
    revenue: number;
    bookings: number;
  }[];
  bookingTrends: {
    date: string;
    bookings: number;
    revenue: number;
  }[];
}

export interface CreateOfficeSpaceDto {
  name: string;
  type: OfficeSpaceType;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  capacity: number;
  area: number;
  pricing: {
    hourly?: number;
    daily: number;
    weekly?: number;
    monthly?: number;
  };
  amenities?: string[]; // amenity IDs - COMMENTED OUT for MVP
  images: string[];
  availability: OfficeSpace['availability'];
}

export interface UpdateOfficeSpaceDto extends Partial<CreateOfficeSpaceDto> {
  status?: OfficeStatus;
}

