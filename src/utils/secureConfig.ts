
interface SecurityConfig {
  fileUpload: {
    maxSize: number;
    allowedTypes: string[];
    maxFiles: number;
  };
  rateLimiting: {
    authAttempts: number;
    authWindow: number;
    fileUploads: number;
    fileUploadWindow: number;
    apiRequests: number;
    apiWindow: number;
  };
  validation: {
    maxTextLength: number;
    maxEmailLength: number;
    minPasswordLength: number;
    maxPasswordLength: number;
  };
  urls: {
    allowedOrigins: string[];
    webhookTimeout: number;
    maxRetries: number;
  };
}

export const securityConfig: SecurityConfig = {
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxFiles: 5
  },
  rateLimiting: {
    authAttempts: 5,
    authWindow: 15 * 60 * 1000, // 15 minutes
    fileUploads: 10,
    fileUploadWindow: 10 * 60 * 1000, // 10 minutes
    apiRequests: 100,
    apiWindow: 60 * 1000 // 1 minute
  },
  validation: {
    maxTextLength: 5000,
    maxEmailLength: 320,
    minPasswordLength: 8,
    maxPasswordLength: 128
  },
  urls: {
    allowedOrigins: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://mwgnpexeymgpzibnkiof.supabase.co',
      // Add your production domain here
    ],
    webhookTimeout: 30000, // 30 seconds
    maxRetries: 3
  }
};

// Add alias for backward compatibility
export const secureConfig = securityConfig;

export const isWebhookEnabled = (): boolean => {
  return !!(import.meta.env.VITE_WEBHOOK_URL || import.meta.env.VITE_WEBHOOK_ENABLED !== 'false');
};

export const getSecurityHeaders = (): Record<string, string> => {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'wasm-unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: https://mwgnpexeymgpzibnkiof.supabase.co",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://mwgnpexeymgpzibnkiof.supabase.co wss://mwgnpexeymgpzibnkiof.supabase.co",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
  };
};

export const validateOrigin = (origin: string): boolean => {
  return securityConfig.urls.allowedOrigins.includes(origin);
};

export const isProduction = (): boolean => {
  return import.meta.env.MODE === 'production';
};

export const isDevelopment = (): boolean => {
  return import.meta.env.MODE === 'development';
};
