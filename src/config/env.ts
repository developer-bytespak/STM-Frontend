// Environment variables configuration
export const env = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' 
    ? 'https://stm-backend-qcaf.onrender.com' 
    : 'http://localhost:8000'),
  API_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
  
  // App Configuration
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'ServiceProStars',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  APP_ENV: process.env.NODE_ENV || 'development',
  
  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  SESSION_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '3600000'), // 1 hour
  
  // Payment Configuration
  STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
  
  // Email Configuration
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@serviceprostars.com',
  
  // SMS Configuration
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  
  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'), // 10MB
  ALLOWED_FILE_TYPES: (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || 'jpg,jpeg,png,pdf,doc,docx').split(','),
  UPLOAD_URL: process.env.NEXT_PUBLIC_UPLOAD_URL || '/api/upload',
  
  // Analytics
  GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '',
  MIXPANEL_TOKEN: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '',
  
  // Feature Flags
  ENABLE_REGISTRATION: process.env.NEXT_PUBLIC_ENABLE_REGISTRATION === 'true',
  ENABLE_PAYMENTS: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
  ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  
  // Rate Limiting
  RATE_LIMIT_REQUESTS: parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT_REQUESTS || '100'),
  RATE_LIMIT_WINDOW: parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  
  // Cache Configuration
  CACHE_TTL: parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || '300'), // 5 minutes
  REDIS_URL: process.env.REDIS_URL || '',
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Security
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'your-encryption-key',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || 'logs/app.log',
  
  // Monitoring
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  HEALTH_CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'), // 30 seconds
} as const;

// Type-safe environment variable access
export function getEnvVar(key: keyof typeof env): string {
  const value = env[key];
  if (typeof value !== 'string') {
    throw new Error(`Environment variable ${key} is not a string`);
  }
  return value;
}

// Environment validation
export function validateEnvironment(): void {
  const requiredVars = [
    'API_URL',
    'APP_NAME',
    'APP_URL',
  ];
  
  const missingVars = requiredVars.filter(varName => !env[varName as keyof typeof env]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Development helpers
export const isDevelopment = env.APP_ENV === 'development';
export const isProduction = env.APP_ENV === 'production';
export const isTest = env.APP_ENV === 'test';


