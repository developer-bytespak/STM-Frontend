import { OfficeSpace, OfficeBooking, OfficeAnalytics, Amenity } from '@/types/office';

// Available Amenities
export const availableAmenities: Amenity[] = [
  { id: '1', name: 'High-Speed WiFi', icon: 'wifi' },
  { id: '2', name: 'Air Conditioning', icon: 'ac' },
  { id: '3', name: 'Coffee Machine', icon: 'coffee' },
  { id: '4', name: 'Printer/Scanner', icon: 'printer' },
  { id: '5', name: 'Whiteboard', icon: 'whiteboard' },
  { id: '6', name: 'Projector', icon: 'projector' },
  { id: '7', name: 'Standing Desk', icon: 'desk' },
  { id: '8', name: 'Parking', icon: 'parking' },
  { id: '9', name: 'Reception Service', icon: 'reception' },
  { id: '10', name: 'Kitchen Access', icon: 'kitchen' },
  { id: '11', name: 'Meeting Rooms', icon: 'meeting' },
  { id: '12', name: '24/7 Access', icon: 'access' },
  { id: '13', name: 'Phone Booth', icon: 'phone' },
  { id: '14', name: 'Lounge Area', icon: 'lounge' },
  { id: '15', name: 'Video Conference Setup', icon: 'video' },
];

// Default availability (Monday-Friday, 9 AM - 6 PM)
const defaultAvailability = {
  monday: { start: '09:00', end: '18:00', available: true },
  tuesday: { start: '09:00', end: '18:00', available: true },
  wednesday: { start: '09:00', end: '18:00', available: true },
  thursday: { start: '09:00', end: '18:00', available: true },
  friday: { start: '09:00', end: '18:00', available: true },
  saturday: { start: '10:00', end: '16:00', available: false },
  sunday: { start: '00:00', end: '00:00', available: false },
};

// 24/7 availability
const fullTimeAvailability = {
  monday: { start: '00:00', end: '23:59', available: true },
  tuesday: { start: '00:00', end: '23:59', available: true },
  wednesday: { start: '00:00', end: '23:59', available: true },
  thursday: { start: '00:00', end: '23:59', available: true },
  friday: { start: '00:00', end: '23:59', available: true },
  saturday: { start: '00:00', end: '23:59', available: true },
  sunday: { start: '00:00', end: '23:59', available: true },
};

// Mock Office Spaces
export const mockOfficeSpaces: OfficeSpace[] = [
  {
    id: 'office-1',
    name: 'Executive Private Office',
    type: 'private_office',
    description: 'Premium private office with stunning city views, perfect for entrepreneurs and small teams. Fully furnished with modern amenities.',
    location: {
      address: '123 Business Plaza, Suite 500',
      city: 'Miami',
      state: 'FL',
      zipCode: '33131',
      coordinates: { lat: 25.7617, lng: -80.1918 },
    },
    capacity: 4,
    area: 250,
    pricing: {
      hourly: 50,
      daily: 350,
      weekly: 2000,
      monthly: 7500,
    },
    amenities: [
      availableAmenities[0], // WiFi
      availableAmenities[1], // AC
      availableAmenities[2], // Coffee
      availableAmenities[6], // Standing Desk
      availableAmenities[7], // Parking
      availableAmenities[11], // 24/7 Access
    ],
    // images: [
    //   '/images/office-1.png',
    //   '/images/office-1-2.png',
    //   '/images/office-1-3.png',
    // ],
    images: [],
    availability: fullTimeAvailability,
    status: 'available',
    totalBookings: 45,
    rating: 4.8,
    reviews: 23,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'office-2',
    name: 'Modern Conference Room',
    type: 'conference_room',
    description: 'State-of-the-art conference room equipped with the latest video conferencing technology and presentation tools. Ideal for client meetings and team workshops.',
    location: {
      address: '456 Tech Hub, Floor 3',
      city: 'Miami',
      state: 'FL',
      zipCode: '33132',
      coordinates: { lat: 25.7743, lng: -80.1937 },
    },
    capacity: 12,
    area: 400,
    pricing: {
      hourly: 80,
      daily: 500,
      weekly: 3000,
    },
    amenities: [
      availableAmenities[0], // WiFi
      availableAmenities[1], // AC
      availableAmenities[4], // Whiteboard
      availableAmenities[5], // Projector
      availableAmenities[14], // Video Conference
      availableAmenities[2], // Coffee
    ],
    // images: [
    //   '/images/conference-1.png',
    //   '/images/conference-1-2.png',
    // ],
    images: [],
    availability: defaultAvailability,
    status: 'available',
    totalBookings: 78,
    rating: 4.9,
    reviews: 42,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'office-3',
    name: 'Coworking Hotdesk',
    type: 'shared_desk',
    description: 'Flexible hotdesking in a vibrant coworking environment. Network with other professionals while enjoying all amenities.',
    location: {
      address: '789 Startup Street',
      city: 'Fort Lauderdale',
      state: 'FL',
      zipCode: '33301',
      coordinates: { lat: 26.1224, lng: -80.1373 },
    },
    capacity: 1,
    area: 50,
    pricing: {
      hourly: 15,
      daily: 50,
      weekly: 300,
      monthly: 800,
    },
    amenities: [
      availableAmenities[0], // WiFi
      availableAmenities[1], // AC
      availableAmenities[2], // Coffee
      availableAmenities[9], // Kitchen
      availableAmenities[13], // Lounge
      availableAmenities[7], // Parking
    ],
    // images: [
    //   '/images/coworking-1.png',
    // ],
    images: [],
    availability: defaultAvailability,
    status: 'available',
    totalBookings: 156,
    rating: 4.6,
    reviews: 89,
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'office-4',
    name: 'Team Private Office',
    type: 'private_office',
    description: 'Spacious private office designed for growing teams. Includes dedicated meeting area and kitchen access.',
    location: {
      address: '321 Enterprise Way',
      city: 'Miami',
      state: 'FL',
      zipCode: '33133',
      coordinates: { lat: 25.7567, lng: -80.2711 },
    },
    capacity: 8,
    area: 500,
    pricing: {
      daily: 600,
      weekly: 3500,
      monthly: 12000,
    },
    amenities: [
      availableAmenities[0], // WiFi
      availableAmenities[1], // AC
      availableAmenities[2], // Coffee
      availableAmenities[3], // Printer
      availableAmenities[4], // Whiteboard
      availableAmenities[9], // Kitchen
      availableAmenities[10], // Meeting Rooms
      availableAmenities[11], // 24/7 Access
    ],
    // images: [
    //   '/images/team-office-1.png',
    //   '/images/team-office-1-2.png',
    // ],
    images: [],
    availability: fullTimeAvailability,
    status: 'occupied',
    totalBookings: 28,
    rating: 4.7,
    reviews: 15,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'office-5',
    name: 'Small Meeting Room',
    type: 'meeting_room',
    description: 'Intimate meeting room perfect for small team huddles and client presentations.',
    location: {
      address: '555 Commerce Center',
      city: 'Miami',
      state: 'FL',
      zipCode: '33134',
      coordinates: { lat: 25.7489, lng: -80.2534 },
    },
    capacity: 6,
    area: 200,
    pricing: {
      hourly: 40,
      daily: 250,
    },
    amenities: [
      availableAmenities[0], // WiFi
      availableAmenities[1], // AC
      availableAmenities[4], // Whiteboard
      availableAmenities[5], // Projector
      availableAmenities[14], // Video Conference
    ],
    // images: [
    //   '/images/meeting-room-1.png',
    // ],
    images: [],
    availability: defaultAvailability,
    status: 'available',
    totalBookings: 92,
    rating: 4.5,
    reviews: 38,
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'office-6',
    name: 'Premium Coworking Space',
    type: 'coworking_space',
    description: 'Dedicated desk in premium coworking space with private locker, ergonomic chair, and access to all facilities.',
    location: {
      address: '888 Innovation Drive',
      city: 'Boca Raton',
      state: 'FL',
      zipCode: '33431',
      coordinates: { lat: 26.3586, lng: -80.0831 },
    },
    capacity: 2,
    area: 80,
    pricing: {
      daily: 75,
      weekly: 400,
      monthly: 1200,
    },
    amenities: [
      availableAmenities[0], // WiFi
      availableAmenities[1], // AC
      availableAmenities[2], // Coffee
      availableAmenities[3], // Printer
      availableAmenities[9], // Kitchen
      availableAmenities[10], // Meeting Rooms
      availableAmenities[13], // Lounge
      availableAmenities[7], // Parking
    ],
    // images: [
    //   '/images/coworking-premium-1.png',
    //   '/images/coworking-premium-2.png',
    // ],
    images: [],
    availability: defaultAvailability,
    status: 'available',
    totalBookings: 64,
    rating: 4.8,
    reviews: 31,
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'office-7',
    name: 'Executive Meeting Suite',
    type: 'meeting_room',
    description: 'Luxury meeting suite with premium furniture and catering options available. Perfect for high-level client meetings.',
    location: {
      address: '999 Elite Plaza',
      city: 'Miami',
      state: 'FL',
      zipCode: '33135',
      coordinates: { lat: 25.7678, lng: -80.1889 },
    },
    capacity: 10,
    area: 350,
    pricing: {
      hourly: 100,
      daily: 700,
    },
    amenities: [
      availableAmenities[0], // WiFi
      availableAmenities[1], // AC
      availableAmenities[4], // Whiteboard
      availableAmenities[5], // Projector
      availableAmenities[14], // Video Conference
      availableAmenities[8], // Reception
      availableAmenities[2], // Coffee
    ],
    // images: [
    //   '/images/executive-suite-1.png',
    // ],
    images: [],
    availability: defaultAvailability,
    status: 'booked',
    totalBookings: 54,
    rating: 5.0,
    reviews: 27,
    createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'office-8',
    name: 'Tech Startup Office',
    type: 'private_office',
    description: 'Modern office space with open layout, designed for tech startups. Includes breakout areas and collaboration zones.',
    location: {
      address: '777 Silicon Avenue',
      city: 'Miami',
      state: 'FL',
      zipCode: '33136',
      coordinates: { lat: 25.7823, lng: -80.1956 },
    },
    capacity: 15,
    area: 800,
    pricing: {
      daily: 800,
      weekly: 5000,
      monthly: 18000,
    },
    amenities: [
      availableAmenities[0], // WiFi
      availableAmenities[1], // AC
      availableAmenities[2], // Coffee
      availableAmenities[3], // Printer
      availableAmenities[4], // Whiteboard
      availableAmenities[9], // Kitchen
      availableAmenities[10], // Meeting Rooms
      availableAmenities[11], // 24/7 Access
      availableAmenities[13], // Lounge
      availableAmenities[7], // Parking
    ],
    // images: [
    //   '/images/startup-office-1.png',
    //   '/images/startup-office-2.png',
    //   '/images/startup-office-3.png',
    // ],
    images: [],
    availability: fullTimeAvailability,
    status: 'maintenance',
    totalBookings: 12,
    rating: 4.9,
    reviews: 8,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Bookings
export const mockOfficeBookings: OfficeBooking[] = [
  {
    id: 'booking-1',
    officeId: 'office-1',
    officeName: 'Executive Private Office',
    providerId: 'provider-123',
    providerName: 'ABC Plumbing Services',
    providerEmail: 'contact@abcplumbing.com',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 1,
    durationType: 'monthly',
    totalAmount: 7500,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    transactionId: 'txn_ABC123456',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'booking-2',
    officeId: 'office-2',
    officeName: 'Modern Conference Room',
    providerId: 'provider-456',
    providerName: 'XYZ Electrical Solutions',
    providerEmail: 'info@xyzelectrical.com',
    startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    duration: 4,
    durationType: 'hourly',
    totalAmount: 320,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    transactionId: 'txn_XYZ789012',
    specialRequests: 'Need video conferencing setup tested before meeting',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'booking-3',
    officeId: 'office-3',
    officeName: 'Coworking Hotdesk',
    providerId: 'provider-789',
    providerName: 'Quick Fix Services',
    providerEmail: 'support@quickfix.com',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 1,
    durationType: 'weekly',
    totalAmount: 300,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'debit_card',
    transactionId: 'txn_QFS345678',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'booking-4',
    officeId: 'office-7',
    officeName: 'Executive Meeting Suite',
    providerId: 'provider-234',
    providerName: 'Premium Home Services',
    providerEmail: 'admin@premiumhome.com',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    duration: 3,
    durationType: 'hourly',
    totalAmount: 300,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'booking-5',
    officeId: 'office-5',
    officeName: 'Small Meeting Room',
    providerId: 'provider-567',
    providerName: 'Elite Cleaning Co',
    providerEmail: 'contact@elitecleaning.com',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    duration: 2,
    durationType: 'hourly',
    totalAmount: 80,
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    transactionId: 'txn_ELC901234',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'booking-6',
    officeId: 'office-2',
    officeName: 'Modern Conference Room',
    providerId: 'provider-891',
    providerName: 'Smart HVAC Solutions',
    providerEmail: 'hello@smarthvac.com',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
    duration: 1,
    durationType: 'daily',
    totalAmount: 500,
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    transactionId: 'txn_SHS567890',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Analytics
export const mockOfficeAnalytics: OfficeAnalytics = {
  totalSpaces: mockOfficeSpaces.length,
  availableSpaces: mockOfficeSpaces.filter(o => o.status === 'available').length,
  occupiedSpaces: mockOfficeSpaces.filter(o => o.status === 'occupied').length,
  totalBookings: mockOfficeBookings.length,
  activeBookings: mockOfficeBookings.filter(b => b.status === 'confirmed').length,
  completedBookings: mockOfficeBookings.filter(b => b.status === 'completed').length,
  totalRevenue: 156750,
  monthlyRevenue: 42850,
  averageBookingDuration: 5.2,
  occupancyRate: 67.5,
  popularSpaceType: 'meeting_room',
  topBookedSpaces: [
    { officeId: 'office-2', officeName: 'Modern Conference Room', bookings: 78, revenue: 39000 },
    { officeId: 'office-3', officeName: 'Coworking Hotdesk', bookings: 156, revenue: 46800 },
    { officeId: 'office-5', officeName: 'Small Meeting Room', bookings: 92, revenue: 23000 },
    { officeId: 'office-1', officeName: 'Executive Private Office', bookings: 45, revenue: 33750 },
    { officeId: 'office-7', officeName: 'Executive Meeting Suite', bookings: 54, revenue: 37800 },
  ],
  revenueBySpaceType: [
    { type: 'meeting_room', revenue: 60800, bookings: 146 },
    { type: 'shared_desk', revenue: 46800, bookings: 156 },
    { type: 'conference_room', revenue: 39000, bookings: 78 },
    { type: 'private_office', revenue: 67500, bookings: 85 },
    { type: 'coworking_space', revenue: 19200, bookings: 64 },
  ],
  bookingTrends: [
    { date: 'Sep 8', bookings: 12, revenue: 4200 },
    { date: 'Sep 11', bookings: 15, revenue: 5800 },
    { date: 'Sep 14', bookings: 18, revenue: 7100 },
    { date: 'Sep 17', bookings: 14, revenue: 5500 },
    { date: 'Sep 20', bookings: 20, revenue: 8400 },
    { date: 'Sep 23', bookings: 22, revenue: 9200 },
    { date: 'Sep 26', bookings: 19, revenue: 7800 },
    { date: 'Sep 29', bookings: 25, revenue: 10500 },
    { date: 'Oct 2', bookings: 21, revenue: 8900 },
    { date: 'Oct 5', bookings: 24, revenue: 10200 },
    { date: 'Oct 8', bookings: 27, revenue: 11500 },
  ],
};

