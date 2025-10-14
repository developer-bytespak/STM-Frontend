/**
 * Slug Generation Utilities
 * Handles conversion of business names to URL-friendly slugs
 */

/**
 * Generate a URL-friendly slug from business name and provider ID
 * @param businessName - The business name to slugify
 * @param providerId - The unique provider ID
 * @returns SEO-friendly slug in format: business-name-{id}
 * 
 * Examples:
 * - "Joe's Plumbing & Heating", 11 → "joes-plumbing-heating-11"
 * - "ABC-123 Services", 22 → "abc-123-services-22"
 * - "José's Café", 33 → "joses-cafe-33"
 */
export function generateProviderSlug(businessName: string, providerId: number): string {
  if (!businessName || businessName.trim() === '') {
    // Fallback for empty/invalid business names
    return `provider-${providerId}`;
  }

  const slug = businessName
    .toLowerCase()
    .trim()
    // Replace accented characters with ASCII equivalents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove special characters except spaces and hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Replace spaces with hyphens
    .replace(/\s/g, '-')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');

  // Truncate if too long (keep room for ID suffix)
  const MAX_SLUG_LENGTH = 50;
  const truncated = slug.length > MAX_SLUG_LENGTH 
    ? slug.substring(0, MAX_SLUG_LENGTH).replace(/-+$/, '') 
    : slug;

  // Return slug with ID suffix
  return `${truncated}-${providerId}`;
}

/**
 * Extract provider ID from a slug
 * @param slug - The slug to parse (e.g., "joes-plumbing-11")
 * @returns Provider ID or null if invalid
 */
export function extractProviderIdFromSlug(slug: string): number | null {
  if (!slug) return null;
  
  // Match the ID at the end of the slug (after last hyphen)
  const match = slug.match(/-(\d+)$/);
  
  if (!match || !match[1]) return null;
  
  const id = parseInt(match[1], 10);
  return isNaN(id) ? null : id;
}

/**
 * Verify that a slug matches the expected format for a provider
 * @param slug - The slug to verify
 * @param businessName - The expected business name
 * @param providerId - The expected provider ID
 * @returns true if slug is valid and matches provider
 */
export function verifyProviderSlug(
  slug: string, 
  businessName: string, 
  providerId: number
): boolean {
  const expectedSlug = generateProviderSlug(businessName, providerId);
  return slug === expectedSlug;
}

/**
 * Generate a service slug from service name
 * @param serviceName - The service name (e.g., "Plumbing Services")
 * @returns URL-friendly service slug (e.g., "plumbing-services")
 */
export function generateServiceSlug(serviceName: string): string {
  if (!serviceName || serviceName.trim() === '') {
    return 'service';
  }

  return serviceName
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

