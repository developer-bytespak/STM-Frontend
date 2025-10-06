export interface CompletedJob {
  id: number;
  providerName: string;
  serviceName: string;
  category: string;
  completedDate: string;
  address: string;
  duration: string;
  totalCost: number;
  status: string;
  providerId: number;
}

export const dummyCompletedJobs: CompletedJob[] = [
  {
    id: 1,
    providerName: "Smith Plumbing Services",
    serviceName: "Pipe Installation",
    category: "Plumbing",
    completedDate: "October 2, 2025",
    address: "123 Main St, New York",
    duration: "2 hours",
    totalCost: 150,
    status: "✅ Completed",
    providerId: 101
  },
  {
    id: 2,
    providerName: "Green Thumb Landscaping",
    serviceName: "Garden Maintenance",
    category: "Landscaping",
    completedDate: "September 28, 2025",
    address: "456 Oak Ave, Brooklyn",
    duration: "3 hours",
    totalCost: 200,
    status: "✅ Completed",
    providerId: 102
  },
  {
    id: 3,
    providerName: "Quick Fix Electric",
    serviceName: "Light Fixture Installation",
    category: "Electrical",
    completedDate: "September 25, 2025",
    address: "789 Pine St, Queens",
    duration: "1.5 hours",
    totalCost: 120,
    status: "✅ Completed",
    providerId: 103
  },
  {
    id: 4,
    providerName: "Clean Pro Services",
    serviceName: "Deep House Cleaning",
    category: "Cleaning",
    completedDate: "September 22, 2025",
    address: "321 Elm St, Manhattan",
    duration: "4 hours",
    totalCost: 180,
    status: "✅ Completed",
    providerId: 104
  },
  {
    id: 5,
    providerName: "Tech Repair Solutions",
    serviceName: "Laptop Screen Replacement",
    category: "Electronics",
    completedDate: "September 20, 2025",
    address: "654 Maple Dr, Bronx",
    duration: "1 hour",
    totalCost: 250,
    status: "✅ Completed",
    providerId: 105
  },
  {
    id: 6,
    providerName: "Home Comfort HVAC",
    serviceName: "AC Unit Maintenance",
    category: "HVAC",
    completedDate: "September 18, 2025",
    address: "987 Cedar Ln, Staten Island",
    duration: "2.5 hours",
    totalCost: 175,
    status: "✅ Completed",
    providerId: 106
  },
  {
    id: 7,
    providerName: "Pro Painters Inc",
    serviceName: "Interior Painting",
    category: "Painting",
    completedDate: "September 15, 2025",
    address: "555 Broadway, Manhattan",
    duration: "6 hours",
    totalCost: 400,
    status: "✅ Completed",
    providerId: 107
  },
  {
    id: 8,
    providerName: "Floor Masters",
    serviceName: "Hardwood Floor Refinishing",
    category: "Flooring",
    completedDate: "September 12, 2025",
    address: "777 Park Ave, Brooklyn",
    duration: "8 hours",
    totalCost: 600,
    status: "✅ Completed",
    providerId: 108
  },
  {
    id: 9,
    providerName: "Smart Home Solutions",
    serviceName: "Smart Lock Installation",
    category: "Security",
    completedDate: "September 10, 2025",
    address: "888 5th Ave, Queens",
    duration: "1 hour",
    totalCost: 180,
    status: "✅ Completed",
    providerId: 109
  },
  {
    id: 10,
    providerName: "Garden Pro Services",
    serviceName: "Tree Trimming",
    category: "Landscaping",
    completedDate: "September 8, 2025",
    address: "999 Forest Dr, Bronx",
    duration: "3 hours",
    totalCost: 220,
    status: "✅ Completed",
    providerId: 110
  },
  {
    id: 11,
    providerName: "Appliance Fix Pro",
    serviceName: "Dishwasher Repair",
    category: "Appliance Repair",
    completedDate: "September 5, 2025",
    address: "111 River St, Staten Island",
    duration: "1.5 hours",
    totalCost: 140,
    status: "✅ Completed",
    providerId: 111
  },
  {
    id: 12,
    providerName: "Window Cleaners Plus",
    serviceName: "Commercial Window Cleaning",
    category: "Cleaning",
    completedDate: "September 3, 2025",
    address: "222 Business Blvd, Manhattan",
    duration: "4 hours",
    totalCost: 300,
    status: "✅ Completed",
    providerId: 112
  }
];
