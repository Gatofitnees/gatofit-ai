
export const getSecureCSPHeaders = () => {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'wasm-unsafe-eval'", // Removed unsafe-inline and unsafe-eval
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Keep unsafe-inline only for styles
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://mwgnpexeymgpzibnkiof.supabase.co wss://mwgnpexeymgpzibnkiof.supabase.co https://api.openai.com",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ')
  };
};

export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  ...getSecureCSPHeaders()
};

export const validateOrigin = (origin: string): boolean => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://your-production-domain.com',
    'https://mwgnpexeymgpzibnkiof.supabase.co'
  ];
  
  return allowedOrigins.includes(origin);
};

export const sanitizeUserInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};
