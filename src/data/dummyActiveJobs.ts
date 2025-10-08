export interface ActiveJob {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  providerId: string;
  providerName: string;
  
  // Job details
  serviceType: string;
  description: string;
  budget: string;
  location: string;
  
  // Status and timing
  status: 'active' | 'pending' | 'in_progress' | 'scheduled' | 'completed' | 'cancelled';
  startDate: string;
  estimatedDuration: string;
  actualStartTime?: string;
  completionDate?: string;
  
  // Additional info
  urgency: string;
  specialInstructions?: string;
  createdAt: string;
  lastUpdated: string;
}

export const dummyActiveJobs: ActiveJob[] = [
  {
    id: 'job-001',
    customerId: 'cust-201',
    customerName: 'Mike Rodriguez',
    customerEmail: 'mike.rodriguez@email.com',
    customerPhone: '+1 (555) 345-6789',
    providerId: '1',
    providerName: 'Smith Plumbing Services',
    serviceType: 'Plumbing Repair',
    description: 'Fix leaking kitchen sink pipe and replace faucet',
    budget: '180',
    location: '456 Oak Street, Portland, OR 97201',
    status: 'in_progress',
    startDate: '2025-01-15',
    estimatedDuration: '2-3 hours',
    actualStartTime: '2025-01-15T10:00:00Z',
    urgency: '24 Hours',
    specialInstructions: 'Customer prefers morning appointments. Call 30 minutes before arrival.',
    createdAt: '2025-01-14T14:30:00Z',
    lastUpdated: '2025-01-15T10:30:00Z'
  },
  {
    id: 'job-002',
    customerId: 'cust-202',
    customerName: 'Emily Chen',
    customerEmail: 'emily.chen@email.com',
    customerPhone: '+1 (555) 456-7890',
    providerId: '1',
    providerName: 'Smith Plumbing Services',
    serviceType: 'Bathroom Remodeling',
    description: 'Install new bathroom fixtures and repair water damage',
    budget: '450',
    location: '789 Pine Avenue, Eugene, OR 97401',
    status: 'scheduled',
    startDate: '2025-01-18',
    estimatedDuration: '4-5 hours',
    urgency: '7 Days',
    specialInstructions: 'Customer will be home all day. Please bring all necessary tools.',
    createdAt: '2025-01-12T09:15:00Z',
    lastUpdated: '2025-01-14T16:45:00Z'
  },
  {
    id: 'job-003',
    customerId: 'cust-203',
    customerName: 'David Thompson',
    customerEmail: 'david.thompson@email.com',
    customerPhone: '+1 (555) 567-8901',
    providerId: '1',
    providerName: 'Smith Plumbing Services',
    serviceType: 'Emergency Repair',
    description: 'Burst pipe emergency - water shutoff and repair',
    budget: '320',
    location: '321 Elm Drive, Salem, OR 97301',
    status: 'active',
    startDate: '2025-01-16',
    estimatedDuration: '3-4 hours',
    urgency: '24 Hours',
    specialInstructions: 'URGENT: Water damage occurring. Customer has shut off main valve.',
    createdAt: '2025-01-16T08:00:00Z',
    lastUpdated: '2025-01-16T08:15:00Z'
  },
  {
    id: 'job-004',
    customerId: 'cust-204',
    customerName: 'Lisa Martinez',
    customerEmail: 'lisa.martinez@email.com',
    customerPhone: '+1 (555) 678-9012',
    providerId: '1',
    providerName: 'Smith Plumbing Services',
    serviceType: 'Drain Cleaning',
    description: 'Kitchen sink drain completely blocked - need professional cleaning',
    budget: '120',
    location: '654 Maple Lane, Bend, OR 97701',
    status: 'pending',
    startDate: '2025-01-17',
    estimatedDuration: '1-2 hours',
    urgency: '3 Days',
    specialInstructions: 'Customer tried DIY solutions but drain is still blocked.',
    createdAt: '2025-01-15T11:20:00Z',
    lastUpdated: '2025-01-15T11:20:00Z'
  },
  {
    id: 'job-005',
    customerId: 'cust-205',
    customerName: 'Robert Wilson',
    customerEmail: 'robert.wilson@email.com',
    customerPhone: '+1 (555) 789-0123',
    providerId: '1',
    providerName: 'Smith Plumbing Services',
    serviceType: 'Water Heater Installation',
    description: 'Replace old water heater with new energy-efficient model',
    budget: '850',
    location: '987 Cedar Street, Medford, OR 97501',
    status: 'completed',
    startDate: '2025-01-14',
    estimatedDuration: '5-6 hours',
    actualStartTime: '2025-01-14T08:00:00Z',
    completionDate: '2025-01-14T15:30:00Z',
    urgency: '7 Days',
    specialInstructions: 'Customer purchased new water heater. Installation only needed.',
    createdAt: '2025-01-10T13:45:00Z',
    lastUpdated: '2025-01-14T15:30:00Z'
  },
  {
    id: 'job-006',
    customerId: 'cust-206',
    customerName: 'Jennifer Brown',
    customerEmail: 'jennifer.brown@email.com',
    customerPhone: '+1 (555) 890-1234',
    providerId: '1',
    providerName: 'Smith Plumbing Services',
    serviceType: 'Pipe Inspection',
    description: 'Camera inspection of main sewer line - suspected blockage',
    budget: '200',
    location: '147 Birch Road, Corvallis, OR 97330',
    status: 'scheduled',
    startDate: '2025-01-19',
    estimatedDuration: '2-3 hours',
    urgency: 'Flexible',
    specialInstructions: 'Customer experiencing slow drains throughout house.',
    createdAt: '2025-01-13T10:30:00Z',
    lastUpdated: '2025-01-15T09:00:00Z'
  }
];

// Helper function to get jobs by status
export const getJobsByStatus = (status: ActiveJob['status']) => {
  return dummyActiveJobs.filter(job => job.status === status);
};

// Helper function to get active jobs count (excluding completed and cancelled)
export const getActiveJobsCount = () => {
  return dummyActiveJobs.filter(job => 
    !['completed', 'cancelled'].includes(job.status)
  ).length;
};

// Helper function to get jobs by provider
export const getJobsByProvider = (providerId: string) => {
  return dummyActiveJobs.filter(job => job.providerId === providerId);
};
