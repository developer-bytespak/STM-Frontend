/**
 * ZIP Code Lookup Utility
 * Centralized helper for fetching ZIP code information from the backend API
 */

export interface ZipCodePlace {
  city: string;
  state: string;
  zipCode?: string;
}

export interface ZipCodeResponse {
  places: ZipCodePlace[];
  zipCode: string;
}

/**
 * Get the configured API base URL
 */
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' 
    ? 'https://stm-backend-qcaf.onrender.com' 
    : 'http://localhost:8000');
}

/**
 * Lookup ZIP code information from the backend API
 * @param zipCode - 5-digit ZIP code string
 * @returns Promise<ZipCodeResponse | null> - ZIP code data or null if not found
 */
export async function lookupZipCode(zipCode: string): Promise<ZipCodeResponse | null> {
  // Validate ZIP code format
  const cleanZipCode = zipCode.replace(/\D/g, '').slice(0, 5);
  if (cleanZipCode.length !== 5) {
    return null;
  }

  try {
    const API_BASE_URL = getApiBaseUrl();
    const response = await fetch(`${API_BASE_URL}/utils/zip/${cleanZipCode}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data as ZipCodeResponse;
  } catch (error) {
    console.warn('ZIP code lookup failed:', error);
    return null;
  }
}

/**
 * Lookup ZIP code and return the first place (city, state) if available
 * @param zipCode - 5-digit ZIP code string
 * @returns Promise<ZipCodePlace | null> - First place data or null if not found
 */
export async function lookupZipCodePlace(zipCode: string): Promise<ZipCodePlace | null> {
  const data = await lookupZipCode(zipCode);
  if (!data || !data.places || data.places.length === 0) {
    return null;
  }
  
  return data.places[0];
}

/**
 * Hook for ZIP code lookup with loading state
 * @param zipCode - ZIP code to lookup
 * @returns Object with place data and loading state
 */
export function useZipCodeLookup(zipCode: string) {
  const [place, setPlace] = React.useState<ZipCodePlace | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!zipCode || zipCode.length !== 5) {
      setPlace(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    lookupZipCodePlace(zipCode)
      .then((result) => {
        setPlace(result);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setPlace(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [zipCode]);

  return { place, loading, error };
}
// Import React for the hook
import React from 'react';

