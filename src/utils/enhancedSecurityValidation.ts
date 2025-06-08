
import { createSecureErrorMessage } from './errorHandling';

// Enhanced rate limiter with security considerations
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number,
    private windowMs: number
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Remove expired attempts
    const validAttempts = userAttempts.filter(
      attempt => now - attempt < this.windowMs
    );
    
    if (validAttempts.length >= this.maxAttempts) {
      logSecurityEvent('rate_limit_exceeded', identifier, 'medium');
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Enhanced password validation
export const validateStrongPassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password || password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/\d/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  // Check for common weak passwords
  const commonPasswords = ['password123', '12345678', 'qwerty123', 'admin123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    return { isValid: false, error: 'Password is too common and easily guessable' };
  }
  
  return { isValid: true };
};

// Enhanced file upload validation
export const validateSecureFileUpload = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
  // File size validation (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }
  
  // File type validation
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only image files (JPEG, PNG, WebP, GIF) are allowed' };
  }
  
  // File name validation
  const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
  if (!fileNameRegex.test(file.name)) {
    return { isValid: false, error: 'File name contains invalid characters' };
  }
  
  return { isValid: true };
};

// Enhanced webhook request validation
export const validateWebhookRequest = (request: any): { isValid: boolean; error?: string } => {
  if (!request) {
    return { isValid: false, error: 'Request is required' };
  }
  
  if (!request.headers) {
    return { isValid: false, error: 'Request headers are required' };
  }
  
  return { isValid: true };
};

// Rate limiters for different operations
export const authRateLimiter = new RateLimiter(5, 300000); // 5 attempts per 5 minutes
export const uploadRateLimiter = new RateLimiter(10, 600000); // 10 uploads per 10 minutes

// Enhanced security event logging
export const logSecurityEvent = (
  event: string, 
  details: string, 
  severity: 'low' | 'medium' | 'high'
): void => {
  const securityLog = {
    timestamp: new Date().toISOString(),
    event,
    details,
    severity,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.warn('Security Event:', securityLog);
  
  // In production, send to security monitoring service
  if (severity === 'high') {
    console.error('HIGH SEVERITY SECURITY EVENT:', securityLog);
  }
};
