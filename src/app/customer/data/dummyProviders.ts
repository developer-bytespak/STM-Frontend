import { Provider } from '@/types/provider';

export const dummyProviders: Provider[] = [
  {
    id: '1',
    role: 'provider',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '+1-555-0101',
    isActive: true,
    isVerified: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-09-28T12:30:00Z',
    businessName: 'Smith Plumbing Services',
    businessType: 'Plumbing',
    description: 'Professional plumbing services with 15+ years of experience. Specializing in residential and commercial repairs, installations, and maintenance.',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '11000',
      country: 'USA'
    },
    services: [
      { id: '1', name: 'Plumbing Repair', category: 'Plumbing', description: 'Fix leaks, clogs, and other plumbing issues', basePrice: 75, duration: 60, isActive: true },
      { id: '2', name: 'Pipe Installation', category: 'Plumbing', description: 'Install new pipes and fixtures', basePrice: 120, duration: 120, isActive: true },
      { id: '3', name: 'Water Heater Service', category: 'Plumbing', description: 'Install and repair water heaters', basePrice: 150, duration: 180, isActive: true }
    ],
    rating: 4.8,
    reviewCount: 127,
    isAvailable: true,
    hourlyRate: 75,
    experience: '15 years',
    certifications: ['Licensed Plumber', 'EPA Certified'],
    workingHours: {
      monday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
      tuesday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
      wednesday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
      thursday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
      friday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
      saturday: { isWorking: false },
      sunday: { isWorking: false }
    }
  },
  {
    id: '2',
    role: 'provider',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@example.com',
    phone: '+1-555-0102',
    isActive: true,
    isVerified: true,
    createdAt: '2024-02-10T09:15:00Z',
    updatedAt: '2024-09-29T10:00:00Z',
    businessName: 'Garcia Electrical Solutions',
    businessType: 'Electrical',
    description: 'Certified electrician providing safe and reliable electrical services for homes and businesses.',
    address: {
      street: '456 Oak Ave',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75001',
      country: 'USA'
    },
    services: [
      { id: '4', name: 'Electrical Repair', category: 'Electrical', description: 'Fix electrical issues and power problems', basePrice: 85, duration: 90, isActive: true },
      { id: '5', name: 'Wiring Installation', category: 'Electrical', description: 'Install new electrical wiring and outlets', basePrice: 150, duration: 240, isActive: true },
      { id: '6', name: 'Light Fixture Installation', category: 'Electrical', description: 'Install and repair light fixtures', basePrice: 100, duration: 120, isActive: true }
    ],
    rating: 4.9,
    reviewCount: 89,
    isAvailable: true,
    hourlyRate: 85,
    experience: '12 years',
    certifications: ['Licensed Electrician', 'Master Electrician'],
    workingHours: {
      monday: { isWorking: true, startTime: '07:00', endTime: '16:00' },
      tuesday: { isWorking: true, startTime: '07:00', endTime: '16:00' },
      wednesday: { isWorking: true, startTime: '07:00', endTime: '16:00' },
      thursday: { isWorking: true, startTime: '07:00', endTime: '16:00' },
      friday: { isWorking: true, startTime: '07:00', endTime: '16:00' },
      saturday: { isWorking: true, startTime: '08:00', endTime: '14:00' },
      sunday: { isWorking: false }
    }
  },
  {
    id: '3',
    role: 'provider',
    firstName: 'David',
    lastName: 'Johnson',
    email: 'david.johnson@example.com',
    phone: '+1-555-0103',
    isActive: true,
    isVerified: true,
    createdAt: '2023-11-05T07:45:00Z',
    updatedAt: '2024-09-30T14:20:00Z',
    businessName: 'Johnson HVAC Services',
    businessType: 'HVAC',
    description: 'Complete heating, ventilation, and air conditioning services. Available 24/7 for emergency repairs.',
    address: {
      street: '789 Pine St',
      city: 'Cleveland',
      state: 'OH',
      zipCode: '44000',
      country: 'USA'
    },
      services: [
        { id: '7', name: 'AC Repair', category: 'HVAC', description: 'Air conditioning repair and maintenance', basePrice: 90, duration: 120, isActive: true },
        { id: '8', name: 'Heating Installation', category: 'HVAC', description: 'Install new heating systems', basePrice: 200, duration: 480, isActive: true },
        { id: '9', name: 'Duct Cleaning', category: 'HVAC', description: 'Professional duct cleaning services', basePrice: 120, duration: 180, isActive: true }
      ],
    rating: 4.7,
    reviewCount: 156,
    isAvailable: false,
    hourlyRate: 90,
    experience: '20 years',
    certifications: ['HVAC Certified', 'EPA Certified'],
    workingHours: {
      monday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
      tuesday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
      wednesday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
      thursday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
      friday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
      saturday: { isWorking: true, startTime: '09:00', endTime: '15:00' },
      sunday: { isWorking: true, startTime: '10:00', endTime: '14:00' }
    }
  },
  {
    id: '4',
    role: 'provider',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@example.com',
    phone: '+1-555-0104',
    isActive: true,
    isVerified: true,
    createdAt: '2024-03-20T11:30:00Z',
    updatedAt: '2024-09-27T16:45:00Z',
    businessName: 'Williams Cleaning Co',
    businessType: 'Cleaning',
    description: 'Professional cleaning services for residential and commercial properties. Eco-friendly products used.',
    address: {
      street: '321 Elm St',
      city: 'New York',
      state: 'NY',
      zipCode: '11000',
      country: 'USA'
    },
      services: [
        { id: '10', name: 'House Cleaning', category: 'Cleaning', description: 'Regular and deep house cleaning', basePrice: 45, duration: 180, isActive: true },
        { id: '11', name: 'Office Cleaning', category: 'Cleaning', description: 'Commercial office cleaning services', basePrice: 60, duration: 240, isActive: true },
        { id: '12', name: 'Move-in/Move-out Cleaning', category: 'Cleaning', description: 'Specialized cleaning for moving', basePrice: 80, duration: 300, isActive: true }
      ],
    rating: 4.6,
    reviewCount: 203,
    isAvailable: true,
    hourlyRate: 45,
    experience: '8 years',
    certifications: ['Bonded & Insured', 'Green Cleaning Certified'],
    workingHours: {
      monday: { isWorking: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { isWorking: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { isWorking: true, startTime: '09:00', endTime: '17:00' },
      thursday: { isWorking: true, startTime: '09:00', endTime: '17:00' },
      friday: { isWorking: true, startTime: '09:00', endTime: '17:00' },
      saturday: { isWorking: true, startTime: '10:00', endTime: '16:00' },
      sunday: { isWorking: false }
    }
  },
  {
    id: '5',
    role: 'provider',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@example.com',
    phone: '+1-555-0105',
    isActive: true,
    isVerified: true,
    createdAt: '2024-04-12T13:00:00Z',
    updatedAt: '2024-09-26T09:30:00Z',
    businessName: 'Brown Painting Pros',
    businessType: 'Painting',
    description: 'Interior and exterior painting services with attention to detail and quality finishes.',
    address: {
      street: '654 Maple Dr',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75001',
      country: 'USA'
    },
      services: [
        { id: '13', name: 'Interior Painting', category: 'Painting', description: 'Professional interior painting services', basePrice: 65, duration: 480, isActive: true },
        { id: '14', name: 'Exterior Painting', category: 'Painting', description: 'Exterior house painting and staining', basePrice: 80, duration: 600, isActive: true },
        { id: '15', name: 'Cabinet Refinishing', category: 'Painting', description: 'Kitchen cabinet painting and refinishing', basePrice: 100, duration: 360, isActive: true }
      ],
    rating: 4.5,
    reviewCount: 94,
    isAvailable: true,
    hourlyRate: 65,
    experience: '10 years',
    certifications: ['Licensed Painter', 'Lead-Safe Certified'],
    workingHours: {
      monday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
      tuesday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
      wednesday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
      thursday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
      friday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
      saturday: { isWorking: false },
      sunday: { isWorking: false }
    }
  }
];

export function filterProvidersByZip(providers: Provider[], zipCode: string): Provider[] {
  return providers.filter(provider => provider.address?.zipCode === zipCode);
}

export function filterProvidersByService(providers: Provider[], serviceName: string): Provider[] {
  return providers.filter(provider => 
    provider.services?.some(service => 
      service.name.toLowerCase().includes(serviceName.toLowerCase()) ||
      service.category.toLowerCase().includes(serviceName.toLowerCase())
    )
  );
}
