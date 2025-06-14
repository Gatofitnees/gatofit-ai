
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateSecureEmail = (email: string): ValidationResult => {
  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Length check
  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  // Local part length check
  const localPart = email.split('@')[0];
  if (localPart.length > 64) {
    return { isValid: false, error: 'Email local part is too long' };
  }

  // Prevent dangerous characters
  const dangerousChars = /[<>'"&]/;
  if (dangerousChars.test(email)) {
    return { isValid: false, error: 'Email contains invalid characters' };
  }

  // Check for multiple @ symbols
  if ((email.match(/@/g) || []).length !== 1) {
    return { isValid: false, error: 'Email must contain exactly one @ symbol' };
  }

  return { isValid: true };
};

export const validateSecureUsername = (username: string): ValidationResult => {
  // Length check
  if (username.length < 3 || username.length > 30) {
    return { isValid: false, error: 'Username must be between 3 and 30 characters' };
  }

  // Character validation - only alphanumeric, underscore, and hyphen
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  // Must start with letter or number
  if (!/^[a-zA-Z0-9]/.test(username)) {
    return { isValid: false, error: 'Username must start with a letter or number' };
  }

  // Prevent reserved usernames
  const reservedUsernames = [
    'admin', 'administrator', 'mod', 'moderator', 'root', 'system',
    'support', 'help', 'api', 'www', 'mail', 'email', 'user', 'users',
    'test', 'guest', 'null', 'undefined', 'false', 'true'
  ];

  if (reservedUsernames.includes(username.toLowerCase())) {
    return { isValid: false, error: 'This username is reserved and cannot be used' };
  }

  return { isValid: true };
};

export const sanitizeInput = (input: string, maxLength: number = 255): string => {
  return input
    .trim()
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
    .substring(0, maxLength);
};

export const sanitizeTextInput = (input: string, maxLength?: number): string => {
  return sanitizeInput(input, maxLength);
};

export const validatePhoneNumber = (phone: string): ValidationResult => {
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check length (assuming international format)
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return { isValid: false, error: 'Phone number must be between 10 and 15 digits' };
  }

  return { isValid: true };
};

export const validateNumericInput = (
  value: any, 
  min: number, 
  max: number, 
  fieldName: string
): ValidationResult => {
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  
  if (numValue < min || numValue > max) {
    return { isValid: false, error: `${fieldName} must be between ${min} and ${max}` };
  }
  
  return { isValid: true };
};
