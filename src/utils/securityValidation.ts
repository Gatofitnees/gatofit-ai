
import { sanitizeFoodName } from './validation';

// Enhanced username validation
export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }

  // Check length
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }

  if (username.length > 20) {
    return { isValid: false, error: 'Username must be no more than 20 characters long' };
  }

  // Check format (alphanumeric and underscore only)
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  // Check for reserved usernames
  const reservedUsernames = [
    'admin', 'administrator', 'root', 'user', 'guest', 'api', 'support',
    'help', 'info', 'contact', 'about', 'privacy', 'terms', 'security',
    'login', 'register', 'signin', 'signup', 'auth', 'authentication',
    'profile', 'account', 'settings', 'dashboard', 'home', 'index',
    'www', 'mail', 'email', 'ftp', 'blog', 'news', 'forum', 'shop',
    'store', 'app', 'mobile', 'api', 'dev', 'developer', 'test', 'demo'
  ];

  if (reservedUsernames.includes(username.toLowerCase())) {
    return { isValid: false, error: 'This username is reserved and cannot be used' };
  }

  // Check for common patterns that might be problematic
  if (username.toLowerCase().includes('gatofit')) {
    return { isValid: false, error: 'Username cannot contain the app name' };
  }

  return { isValid: true };
};

// Enhanced webhook response validation
export const validateWebhookResponse = (data: any): { isValid: boolean; error?: string } => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid webhook response format' };
  }

  // Validate required fields exist
  const requiredFields = ['custom_food_name'];
  for (const field of requiredFields) {
    if (!data[field]) {
      return { isValid: false, error: `Missing required field: ${field}` };
    }
  }

  // Sanitize and validate text fields
  if (data.custom_food_name) {
    const sanitized = sanitizeFoodName(data.custom_food_name);
    if (sanitized.length === 0) {
      return { isValid: false, error: 'Food name contains only invalid characters' };
    }
    if (sanitized.length > 100) {
      return { isValid: false, error: 'Food name is too long' };
    }
  }

  // Validate numeric fields
  const numericFields = ['calories_consumed', 'protein_g_consumed', 'carbs_g_consumed', 'fat_g_consumed'];
  for (const field of numericFields) {
    if (data[field] !== undefined && data[field] !== null) {
      const value = Number(data[field]);
      if (isNaN(value) || value < 0 || value > 10000) {
        return { isValid: false, error: `Invalid value for ${field}` };
      }
    }
  }

  // Validate ingredients if present
  if (data.ingredients && Array.isArray(data.ingredients)) {
    for (const ingredient of data.ingredients) {
      if (!ingredient.name || typeof ingredient.name !== 'string') {
        return { isValid: false, error: 'Invalid ingredient name' };
      }
      
      const sanitizedName = sanitizeFoodName(ingredient.name);
      if (sanitizedName.length === 0) {
        return { isValid: false, error: 'Ingredient name contains only invalid characters' };
      }

      const numFields = ['grams', 'calories', 'protein', 'carbs', 'fat'];
      for (const field of numFields) {
        if (ingredient[field] !== undefined) {
          const value = Number(ingredient[field]);
          if (isNaN(value) || value < 0 || value > 1000) {
            return { isValid: false, error: `Invalid ingredient ${field}` };
          }
        }
      }
    }
  }

  return { isValid: true };
};

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Filter out old requests outside the time window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

// Content Security Policy helper
export const getSecurityHeaders = () => {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://mwgnpexeymgpzibnkiof.supabase.co wss://mwgnpexeymgpzibnkiof.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
};

// SQL injection prevention for dynamic queries
export const sanitizeQueryParam = (param: string): string => {
  if (typeof param !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters
  return param
    .replace(/[';]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*.*?\*\//g, '')
    .replace(/\bUNION\b/gi, '')
    .replace(/\bSELECT\b/gi, '')
    .replace(/\bINSERT\b/gi, '')
    .replace(/\bUPDATE\b/gi, '')
    .replace(/\bDELETE\b/gi, '')
    .replace(/\bDROP\b/gi, '')
    .trim();
};
