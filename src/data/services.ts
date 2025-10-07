// Hierarchical service data structure with two levels: category -> granular services
export interface ServiceCategory {
  name: string;
  granularServices: string[];
}

export interface ServiceSearchResult {
  category: string;
  granularService?: string;
  isGranular: boolean;
}

export const SERVICES: Record<string, string[]> = {
  "Accountant": ["Tax Filing", "Business Planning"],
  "Architect": ["Construction Drawings"],
  "Engineer": [],
  "Land Surveyor": [],
  "Computer Programmer": [],
  "Consultant": ["Business Planning"],
  "Software Specialist": ["Software Implementation"],
  "Handyman": ["Toilet Replacement", "Appliance Replacement"],
  "Veterinarian": [],
  "Photographer": [],
  "Real Estate Agent": [],
  "Mental Health Counselor": [],
  "In Home Health Care": [],
  "Tutor": [
    "Guitar Lessons",
    "Piano Lessons",
    "Jewelry Making Party",
    "Stained Glass Making Tutor",
    "Spanish Language Tutor"
  ],
  "Coach": ["Voice Coach", "Baseball Coach", "Softball Coach"],
  "BabySitting": [],
  "Plumber": ["Toilet Clog", "Toilet Replacement"],
  "Electrician": [],
  "HVAC": [],
  "Carpenter": [],
  "Garage Door Technician": [],
  "Windshield Technician": [],
  "Exterior Cleaning": [
    "House/Building Wash",
    "Gutter Cleaning",
    "Roof Cleaning",
    "Driveway Wash",
    "Deck Cleaning",
    "Window Washing"
  ],
  "Garbage and Junk Removal Specialist": [],
  "Copywriter": [],
  "Publisher": [],
  "Interior Cleaning": ["House Cleaning", "Office Cleaning"],
  "Pest Control": [],
  "Media Organizing": [],
  "Barber": [],
  "Hair Stylist": []
};

// Helper function to search both categories and granular services
export function searchServices(query: string): ServiceSearchResult[] {
  if (query.length < 3) return [];
  
  const results: ServiceSearchResult[] = [];
  const lowerQuery = query.toLowerCase();
  
  // Search through categories and their granular services
  Object.entries(SERVICES).forEach(([category, granularServices]) => {
    const categoryLower = category.toLowerCase();
    const categoryMatches = categoryLower.includes(lowerQuery);
    
    // Find granular services that match the query
    const matchingServices = granularServices.filter(service => 
      service.toLowerCase().includes(lowerQuery)
    );
    
    // Only add if category matches OR if there are matching services
    if (categoryMatches || matchingServices.length > 0) {
      // Add category header only if it matches
      if (categoryMatches) {
        results.push({
          category,
          isGranular: false
        });
      }
      
      // Add only the matching granular services
      matchingServices.forEach(granularService => {
        results.push({
          category,
          granularService,
          isGranular: true
        });
      });
    }
  });
  
  return results;
}

// Helper function to get granular services for a category
export function getGranularServices(category: string): string[] {
  return SERVICES[category] || [];
}

// Helper function to check if a service is a category
export function isCategory(serviceName: string): boolean {
  return serviceName in SERVICES;
}

// Helper function to check if a service is granular
export function isGranularService(serviceName: string): boolean {
  return Object.values(SERVICES).flat().includes(serviceName);
}

// Helper function to get category for a granular service
export function getCategoryForGranularService(granularService: string): string | null {
  for (const [category, services] of Object.entries(SERVICES)) {
    if (services.includes(granularService)) {
      return category;
    }
  }
  return null;
}
