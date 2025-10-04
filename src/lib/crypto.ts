// Simple password hashing utilities for frontend demo
// NOTE: This is NOT cryptographically secure for production!
// In production, use proper backend authentication with bcrypt/argon2

/**
 * Simple hash function for demo purposes
 * In production, this should be done on the backend with proper salting
 */
export async function hashPassword(password: string): Promise<string> {
  // Use Web Crypto API for basic hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Generate a random salt (for better security in production)
 */
export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash password with salt (better practice)
 */
export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const combined = password + salt;
  return await hashPassword(combined);
}

// NOTE FOR PRODUCTION:
// =====================
// 1. NEVER hash passwords on the frontend
// 2. Send plain passwords over HTTPS to backend
// 3. Backend hashes with bcrypt/argon2 with proper salts
// 4. Store only hashed passwords in database
// 5. Use JWT tokens or sessions for authentication
// 6. Implement rate limiting, 2FA, etc.

