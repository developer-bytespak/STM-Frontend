// Service Categories Configuration
export interface Service {
  name: string;
  description: string;
}

export interface ServiceCategory {
  category: string;
  icon: string;
  services: Service[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    category: "Professional Services",
    icon: "💼",
    services: [
      { name: "Accountant", description: "Business Planning" },
      { name: "Architect", description: "Architecture" },
      { name: "Engineer", description: "Engineering" },
      { name: "Land Surveyor", description: "Land Surveyor" },
      { name: "Document Programmer", description: "Document Programmer" },
      { name: "Consultant", description: "Business Planning" },
      { name: "Software Specialist", description: "Software Implementation" },
    ],
  },
  {
    category: "Home Repair & Maintenance",
    icon: "🔧",
    services: [
      { name: "Electrician", description: "Electrical Repair/Replacement" },
      { name: "Handyman", description: "Appliance Repair/Replacement" },
      { name: "Mechanic", description: "Vehicle Repair" },
      { name: "Plumber", description: "Plumbing Repair/Replacement" },
      { name: "Plumber", description: "Toilet Repair" },
      { name: "Plumber", description: "Toilet Replacement" },
      { name: "Carpenter", description: "Carpenter" },
      { name: "Garage Door Technician", description: "Garage Door Technician" },
      { name: "Appliance Technician", description: "Appliance Technician" },
    ],
  },
  {
    category: "Cleaning Services",
    icon: "🧹",
    services: [
      { name: "Exterior Cleaner", description: "House Wash / Building Wash (Not Roof)" },
      { name: "Exterior Cleaner", description: "Gutter Cleaning" },
      { name: "Exterior Cleaner", description: "Pool Cleaning" },
      { name: "Exterior Cleaner", description: "Driveway Wash" },
      { name: "Exterior Cleaner", description: "Deck Cleaning" },
      { name: "Exterior Cleaner", description: "Patio Cleaning" },
      { name: "Exterior Cleaner", description: "Window Washing" },
      { name: "Interior Cleaning/Janitorial", description: "House Cleaning" },
      { name: "Interior Cleaning/Janitorial", description: "Office Cleaning" },
      { name: "Garbage and Junk Removal", description: "Garbage and Junk Removal Specialist" },
    ],
  },
  {
    category: "Tutoring & Education",
    icon: "📚",
    services: [
      { name: "Tutor/Coach", description: "Music Lesson" },
      { name: "Tutor/Coach", description: "Academic Tutoring" },
      { name: "Tutor/Coach", description: "Jewelry Making Party" },
      { name: "Tutor/Coach", description: "Yoga Class" },
      { name: "Tutor/Coach", description: "Language Class/Party" },
      { name: "Tutor/Coach", description: "Spanish Language Tutor" },
      { name: "Baseball Instructor", description: "Baseball Lesson" },
    ],
  },
  {
    category: "Health & Wellness",
    icon: "🏥",
    services: [
      { name: "Mental Health Counselor", description: "Mental Health Counselor" },
      { name: "In Home Health Care", description: "In Home Health Care" },
    ],
  },
  {
    category: "Personal Care",
    icon: "💇",
    services: [
      { name: "Barber", description: "Barber" },
      { name: "Hair Stylist", description: "Hair Stylist" },
      { name: "Babysitting", description: "Babysitting" },
    ],
  },
  {
    category: "Real Estate & Property",
    icon: "🏠",
    services: [
      { name: "Real Estate Agent", description: "Real Estate Agent" },
    ],
  },
  {
    category: "Other Services",
    icon: "⚙️",
    services: [
      { name: "Excavator", description: "Excavator" },
      { name: "Publisher", description: "Publisher" },
      { name: "Pest Control", description: "Pest Control" },
      { name: "Media Consultant", description: "Media Consultant" },
    ],
  },
];

// Get all services count
export const getTotalServicesCount = () => {
  return SERVICE_CATEGORIES.reduce((total, category) => total + category.services.length, 0);
};

