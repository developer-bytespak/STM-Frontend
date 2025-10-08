export interface CustomerJobRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  providerId: string;
  providerName: string;
  
  // Booking form data
  serviceType: string;
  description: string;
  dimensions?: string;
  budget: string;
  preferredDate?: string;
  urgency: string;
  additionalDetails?: string;
  
  // Metadata
  status: 'pending' | 'accepted' | 'rejected' | 'quoted';
  createdAt: string;
  location?: string;
}

export const dummyCustomerRequests: CustomerJobRequest[] = [
  {
    id: 'req-001',
    customerId: 'cust-101',
    customerName: 'John Doe',
    customerEmail: 'john.doe@email.com',
    customerPhone: '+1 (555) 123-4567',
    providerId: '1',
    providerName: 'Smith Plumbing Services',
    serviceType: 'Plumbing Repair',
    description: 'I have a leaking pipe under my kitchen sink. Water is dripping constantly and I need this fixed urgently. The leak started yesterday and is getting worse.',
    dimensions: '2 pipes, 1 sink area',
    budget: '150',
    preferredDate: '2025-10-10',
    urgency: '24 Hours',
    additionalDetails: 'I am available between 9 AM to 5 PM on weekdays. Please call before arriving.',
    status: 'pending',
    createdAt: '2025-10-08T09:30:00Z',
    location: '123 Main St, Salem, OR 97301'
  },
  {
    id: 'req-002',
    customerId: 'cust-102',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@email.com',
    customerPhone: '+1 (555) 234-5678',
    providerId: '2',
    providerName: 'Garcia Electrical Solutions',
    serviceType: 'Electrical Repair',
    description: 'Need to install 3 new outlets in my living room and replace 2 light fixtures in the bedroom. The current outlets are not working properly.',
    dimensions: '3 outlets, 2 light fixtures',
    budget: '250',
    preferredDate: '2025-10-12',
    urgency: '3 Days',
    additionalDetails: 'I have already purchased the light fixtures. They are ready for installation.',
    status: 'pending',
    createdAt: '2025-10-08T10:15:00Z',
    location: '456 Oak Ave, Dallas, TX 75001'
  },
  {
    id: 'req-003',
    customerId: 'cust-103',
    customerName: 'Mike Williams',
    customerEmail: 'mike.w@email.com',
    customerPhone: '+1 (555) 345-6789',
    providerId: '3',
    providerName: 'Johnson HVAC Services',
    serviceType: 'AC Repair',
    description: 'My air conditioning unit is making strange noises and not cooling properly. It seems like it needs maintenance or repair. The house is getting very hot.',
    dimensions: '1500 sq ft house',
    budget: '200',
    preferredDate: '2025-10-09',
    urgency: '24 Hours',
    additionalDetails: 'The AC unit is about 5 years old. Located on the roof.',
    status: 'pending',
    createdAt: '2025-10-08T11:00:00Z',
    location: '789 Pine St, Salem, OR 97302'
  },
  {
    id: 'req-004',
    customerId: 'cust-104',
    customerName: 'Emily Davis',
    customerEmail: 'emily.d@email.com',
    customerPhone: '+1 (555) 456-7890',
    providerId: '4',
    providerName: 'Williams Cleaning Co',
    serviceType: 'House Cleaning',
    description: 'Looking for a deep cleaning service for my 3-bedroom house. Need all rooms cleaned including kitchen, bathrooms, living areas, and windows.',
    dimensions: '2000 sq ft, 3 bedrooms, 2 bathrooms',
    budget: '180',
    preferredDate: '2025-10-15',
    urgency: '7 Days',
    additionalDetails: 'Please use eco-friendly cleaning products. I have pets (1 dog).',
    status: 'pending',
    createdAt: '2025-10-08T08:45:00Z',
    location: '321 Elm St, Portland, OR 97201'
  },
  {
    id: 'req-005',
    customerId: 'cust-105',
    customerName: 'Robert Brown',
    customerEmail: 'robert.b@email.com',
    customerPhone: '+1 (555) 567-8901',
    providerId: '5',
    providerName: 'Brown Painting Pros',
    serviceType: 'Interior Painting',
    description: 'Need to paint 2 bedrooms and 1 living room. Walls need to be prepped and painted with neutral colors. Looking for a professional finish.',
    dimensions: '3 rooms, approximately 800 sq ft total',
    budget: '450',
    preferredDate: '2025-10-20',
    urgency: 'Flexible',
    additionalDetails: 'I will provide the paint. Need help with color consultation as well.',
    status: 'pending',
    createdAt: '2025-10-07T14:20:00Z',
    location: '654 Maple Dr, Dallas, TX 75001'
  },
  {
    id: 'req-006',
    customerId: 'cust-106',
    customerName: 'Lisa Martinez',
    customerEmail: 'lisa.m@email.com',
    customerPhone: '+1 (555) 678-9012',
    providerId: '1',
    providerName: 'Smith Plumbing Services',
    serviceType: 'Pipe Installation',
    description: 'Need to install new water pipes in the basement for a bathroom renovation project. This includes hot and cold water lines.',
    dimensions: '30 feet of piping, 1 bathroom',
    budget: '300',
    preferredDate: '2025-10-18',
    urgency: '7 Days',
    additionalDetails: 'Renovation project starting next week. Need this completed before tile work begins.',
    status: 'pending',
    createdAt: '2025-10-07T16:00:00Z',
    location: '890 River St, Salem, OR 97301'
  },
  {
    id: 'req-007',
    customerId: 'cust-107',
    customerName: 'David Chen',
    customerEmail: 'david.c@email.com',
    customerPhone: '+1 (555) 789-0123',
    providerId: '2',
    providerName: 'Garcia Electrical Solutions',
    serviceType: 'Wiring Installation',
    description: 'Installing a home theater system and need proper wiring for speakers, TV, and other equipment. Need professional electrical work.',
    dimensions: '1 room, 5 speaker outlets, 2 TV outlets',
    budget: '350',
    preferredDate: '2025-10-14',
    urgency: '3 Days',
    additionalDetails: 'All equipment is ready. Just need the electrical work completed.',
    status: 'pending',
    createdAt: '2025-10-07T13:30:00Z',
    location: '234 Tech Ave, Dallas, TX 75002'
  },
  {
    id: 'req-008',
    customerId: 'cust-108',
    customerName: 'Amanda White',
    customerEmail: 'amanda.w@email.com',
    customerPhone: '+1 (555) 890-1234',
    providerId: '4',
    providerName: 'Williams Cleaning Co',
    serviceType: 'Office Cleaning',
    description: 'Need regular office cleaning service for a small office space. Looking for weekly cleaning including vacuuming, dusting, and bathroom cleaning.',
    dimensions: '1200 sq ft office space',
    budget: '120',
    preferredDate: '2025-10-11',
    urgency: '3 Days',
    additionalDetails: 'Looking for recurring weekly service. Office hours are 9 AM to 6 PM.',
    status: 'pending',
    createdAt: '2025-10-06T10:00:00Z',
    location: '567 Business Park, Portland, OR 97203'
  }
];

