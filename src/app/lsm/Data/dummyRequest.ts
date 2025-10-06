export interface SPRequest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
  experience: string;
  description: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  documents?: {
    type: string;
    description: string;
    uploaded: boolean;
  }[];
}

export const dummySPRequests: SPRequest[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    serviceType: "Plumbing",
    experience: "5 years",
    description: "Professional plumber with 5+ years of experience in residential and commercial plumbing services.",
    location: "New York, NY",
    minPrice: "$50",
    maxPrice: "$150",
    submittedDate: "2025-01-15",
    status: "pending",
    documents: [
      { type: "License", description: "Plumbing License", uploaded: true },
      { type: "Insurance", description: "Liability Insurance", uploaded: true },
      { type: "ID", description: "Government ID", uploaded: true }
    ]
  },
  {
    id: 2,
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 234-5678",
    serviceType: "Electrical",
    experience: "3 years",
    description: "Certified electrician specializing in residential electrical work and smart home installations.",
    location: "Brooklyn, NY",
    minPrice: "$75",
    maxPrice: "$200",
    submittedDate: "2025-01-14",
    status: "pending",
    documents: [
      { type: "License", description: "Electrical License", uploaded: true },
      { type: "Insurance", description: "Liability Insurance", uploaded: true },
      { type: "ID", description: "Government ID", uploaded: false }
    ]
  },
  {
    id: 3,
    firstName: "Mike",
    lastName: "Davis",
    email: "mike.davis@email.com",
    phone: "+1 (555) 345-6789",
    serviceType: "Cleaning",
    experience: "2 years",
    description: "Professional cleaning services for residential and office spaces with eco-friendly products.",
    location: "Queens, NY",
    minPrice: "$25",
    maxPrice: "$100",
    submittedDate: "2025-01-13",
    status: "pending",
    documents: [
      { type: "Insurance", description: "Liability Insurance", uploaded: true },
      { type: "ID", description: "Government ID", uploaded: true }
    ]
  },
  {
    id: 4,
    firstName: "Lisa",
    lastName: "Wilson",
    email: "lisa.wilson@email.com",
    phone: "+1 (555) 456-7890",
    serviceType: "HVAC",
    experience: "7 years",
    description: "HVAC technician with extensive experience in heating, cooling, and ventilation systems.",
    location: "Manhattan, NY",
    minPrice: "$100",
    maxPrice: "$300",
    submittedDate: "2025-01-12",
    status: "pending",
    documents: [
      { type: "License", description: "HVAC License", uploaded: true },
      { type: "Insurance", description: "Liability Insurance", uploaded: true },
      { type: "ID", description: "Government ID", uploaded: true }
    ]
  },
  {
    id: 5,
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@email.com",
    phone: "+1 (555) 567-8901",
    serviceType: "Landscaping",
    experience: "4 years",
    description: "Landscape designer and maintenance specialist with expertise in garden design and maintenance.",
    location: "Bronx, NY",
    minPrice: "$40",
    maxPrice: "$120",
    submittedDate: "2025-01-11",
    status: "pending",
    documents: [
      { type: "Insurance", description: "Liability Insurance", uploaded: true },
      { type: "ID", description: "Government ID", uploaded: true }
    ]
  }
];
