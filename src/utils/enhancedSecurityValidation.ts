
import { sanitizeFoodName } from './validation';
import { RateLimiter } from './securityValidation';

// Enhanced password validation with stronger requirements
export const validateStrongPassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  // Minimum 8 characters
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  // Maximum 128 characters to prevent DoS
  if (password.length > 128) {
    return { isValid: false, error: 'Password must be no more than 128 characters long' };
  }

  // Must contain at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  // Must contain at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  // Must contain at least one number
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  // Must contain at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)' };
  }

  // Check for common weak patterns
  const weakPatterns = [
    /(.)\1{2,}/, // Three or more repeated characters
    /123456/, // Sequential numbers
    /abcdef/, // Sequential letters
    /qwerty/i, // Keyboard patterns
    /password/i, // Common word
    /gatofit/i // App name
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      return { isValid: false, error: 'Password contains weak patterns. Please choose a stronger password.' };
    }
  }

  return { isValid: true };
};

// Enhanced file validation with header checking
export const validateSecureFileUpload = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
  // Basic validations
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, WebP, and GIF files are allowed' };
  }

  // Check file header to prevent MIME type spoofing
  const header = await readFileHeader(file);
  if (!isValidImageHeader(header, file.type)) {
    return { isValid: false, error: 'Invalid image file or corrupted header' };
  }

  // Check for malicious patterns in filename
  if (containsMaliciousPatterns(file.name)) {
    return { isValid: false, error: 'Invalid filename' };
  }

  return { isValid: true };
};

// Read first few bytes of file to check header
const readFileHeader = (file: File): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        const arrayBuffer = reader.result as ArrayBuffer;
        resolve(new Uint8Array(arrayBuffer.slice(0, 12)));
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file.slice(0, 12));
  });
};

// Validate image headers against known signatures
const isValidImageHeader = (header: Uint8Array, mimeType: string): boolean => {
  const signatures = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/jpg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46], [0x57, 0x45, 0x42, 0x50]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]]
  };

  const expectedSignatures = signatures[mimeType as keyof typeof signatures];
  if (!expectedSignatures) return false;

  return expectedSignatures.some(signature => 
    signature.every((byte, index) => header[index] === byte)
  );
};

// Check for malicious patterns in filenames
const containsMaliciousPatterns = (filename: string): boolean => {
  const maliciousPatterns = [
    /\.\./,                    // Directory traversal
    /[<>:"|?*]/,              // Windows forbidden characters
    /[\x00-\x1f\x80-\x9f]/,   // Control characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
    /\.php$/i,                // Executable files
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.vbs$/i,
    /\.js$/i
  ];

  return maliciousPatterns.some(pattern => pattern.test(filename));
};

// Rate limiter for authentication attempts
export const authRateLimiter = new RateLimiter(5, 300000); // 5 attempts per 5 minutes

// Enhanced request validation for webhook calls
export const validateWebhookRequest = (url: string, data: any): { isValid: boolean; error?: string } => {
  // Validate URL format and security
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'Invalid webhook URL' };
  }

  // Must use HTTPS
  if (!url.startsWith('https://')) {
    return { isValid: false, error: 'Webhook URL must use HTTPS' };
  }

  // Prevent SSRF attacks by blocking private IP ranges
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Block localhost and private networks
    const blockedPatterns = [
      /^localhost$/i,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^169\.254\./, // Link-local
      /^0\./,        // "This network"
      /::1/,         // IPv6 localhost
      /^fc00::/,     // IPv6 private
      /^fe80::/      // IPv6 link-local
    ];

    if (blockedPatterns.some(pattern => pattern.test(hostname))) {
      return { isValid: false, error: 'Webhook URL points to private network' };
    }
  } catch (error) {
    return { isValid: false, error: 'Invalid webhook URL format' };
  }

  // Validate request data size
  const dataString = JSON.stringify(data);
  if (dataString.length > 1024 * 1024) { // 1MB limit
    return { isValid: false, error: 'Request data too large' };
  }

  return { isValid: true };
};

// Enhanced Content Security Policy
export const getEnhancedSecurityHeaders = () => {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.gpteng.co",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: https://mwgnpexeymgpzibnkiof.supabase.co",
      "connect-src 'self' https://mwgnpexeymgpzibnkiof.supabase.co wss://mwgnpexeymgpzibnkiof.supabase.co https://gaton8n.gatofit.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-site'
  };
};

// Security event logging with detailed context
export const logSecurityEvent = (eventType: string, details: string, severity: 'low' | 'medium' | 'high' = 'medium') => {
  const timestamp = new Date().toISOString();
  const userAgent = navigator.userAgent;
  const url = window.location.href;
  
  console.warn(`[SECURITY-${severity.toUpperCase()}] ${timestamp}`, {
    eventType,
    details,
    userAgent,
    url,
    timestamp
  });

  // In production, you might want to send this to a logging service
  // Example: Send to Supabase for audit trail
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Could implement audit logging to database here
  }
};
