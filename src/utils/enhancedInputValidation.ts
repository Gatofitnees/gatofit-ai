
// Enhanced input validation utilities
import DOMPurify from 'dompurify';

// Sanitize and validate text inputs
export const sanitizeTextInput = (input: string, maxLength: number = 255): string => {
  if (!input) return '';
  
  // Remove dangerous scripts and HTML
  const sanitized = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  });
  
  // Trim whitespace and limit length
  return sanitized.trim().substring(0, maxLength);
};

// Validate email format with enhanced security
export const validateSecureEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  // Basic format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Check for dangerous characters
  if (/[<>'";&]/.test(email)) {
    return { isValid: false, error: 'Email contains invalid characters' };
  }

  // Length validation
  if (email.length > 320) { // RFC standard max length
    return { isValid: false, error: 'Email is too long' };
  }

  return { isValid: true };
};

// Enhanced username validation
export const validateSecureUsername = (username: string): { isValid: boolean; error?: string } => {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }

  // Length validation
  if (username.length < 3 || username.length > 30) {
    return { isValid: false, error: 'Username must be between 3 and 30 characters' };
  }

  // Character validation - only alphanumeric, underscore, and hyphen
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  // Must start with letter or number
  if (!/^[a-zA-Z0-9]/.test(username)) {
    return { isValid: false, error: 'Username must start with a letter or number' };
  }

  // Reserved usernames
  const reservedNames = [
    'admin', 'administrator', 'root', 'system', 'api', 'www', 'mail', 'ftp',
    'support', 'help', 'info', 'contact', 'service', 'user', 'guest', 'public',
    'private', 'secure', 'test', 'demo', 'null', 'undefined', 'anonymous'
  ];

  if (reservedNames.includes(username.toLowerCase())) {
    return { isValid: false, error: 'This username is reserved and cannot be used' };
  }

  return { isValid: true };
};

// Validate numeric inputs with bounds
export const validateNumericInput = (
  value: number | string,
  min: number,
  max: number,
  fieldName: string
): { isValid: boolean; error?: string; sanitizedValue?: number } => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  if (numValue < min || numValue > max) {
    return { isValid: false, error: `${fieldName} must be between ${min} and ${max}` };
  }

  return { isValid: true, sanitizedValue: numValue };
};

// Enhanced file validation
export const validateSecureFileUpload = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
  // File size validation (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }

  // MIME type validation
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPG, PNG, and WebP images are allowed' };
  }

  // File header validation to prevent MIME type spoofing
  try {
    const header = await readFileHeader(file);
    if (!validateFileHeader(header, file.type)) {
      return { isValid: false, error: 'File type validation failed' };
    }
  } catch (error) {
    return { isValid: false, error: 'File validation error' };
  }

  return { isValid: true };
};

// Helper function to read file header
const readFileHeader = (file: File): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(new Uint8Array(e.target.result as ArrayBuffer));
      } else {
        reject(new Error('Failed to read file header'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsArrayBuffer(file.slice(0, 8));
  });
};

// Validate file header matches MIME type
const validateFileHeader = (header: Uint8Array, mimeType: string): boolean => {
  const signatures: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/jpg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]] // RIFF signature
  };

  const expectedSignatures = signatures[mimeType];
  if (!expectedSignatures) return false;

  return expectedSignatures.some(signature =>
    signature.every((byte, index) => header[index] === byte)
  );
};
