import { logSecurityEvent } from './securityLogger';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateSecureFileUpload = async (file: File): Promise<FileValidationResult> => {
  // File size check (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    logSecurityEvent('file_upload_size_exceeded', `File size: ${file.size}`, 'medium');
    return { isValid: false, error: 'File size must be less than 5MB' };
  }

  // File type whitelist
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    logSecurityEvent('file_upload_invalid_type', `File type: ${file.type}`, 'medium');
    return { isValid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  // File name validation
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (dangerousChars.test(file.name)) {
    logSecurityEvent('file_upload_dangerous_filename', file.name, 'medium');
    return { isValid: false, error: 'File name contains invalid characters' };
  }

  // File extension validation
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    logSecurityEvent('file_upload_invalid_extension', fileExtension || 'none', 'medium');
    return { isValid: false, error: 'File must have a valid image extension' };
  }

  // Check file signature (magic bytes)
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Check for common image signatures
    const isValidImage = 
      (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) || // JPEG
      (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) || // PNG
      (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46); // WebP/RIFF

    if (!isValidImage) {
      logSecurityEvent('file_upload_invalid_signature', 'Invalid file signature', 'high');
      return { isValid: false, error: 'File does not appear to be a valid image' };
    }
  } catch (error) {
    logSecurityEvent('file_upload_signature_check_failed', 'Failed to read file', 'medium');
    return { isValid: false, error: 'Unable to validate file integrity' };
  }

  return { isValid: true };
};

export const validateWebhookPayload = (payload: any): FileValidationResult => {
  // Check for required fields
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, error: 'Invalid payload format' };
  }

  // Validate image URL if present
  if (payload.imageUrl && typeof payload.imageUrl === 'string') {
    const urlPattern = /^https:\/\/[a-zA-Z0-9.-]+\/[a-zA-Z0-9._/-]+\.(jpg|jpeg|png|webp)$/i;
    if (!urlPattern.test(payload.imageUrl)) {
      logSecurityEvent('webhook_invalid_image_url', payload.imageUrl, 'medium');
      return { isValid: false, error: 'Invalid image URL format' };
    }
  }

  // Validate numeric fields
  if (payload.calories && (typeof payload.calories !== 'number' || payload.calories < 0 || payload.calories > 10000)) {
    return { isValid: false, error: 'Invalid calories value' };
  }

  if (payload.protein && (typeof payload.protein !== 'number' || payload.protein < 0 || payload.protein > 1000)) {
    return { isValid: false, error: 'Invalid protein value' };
  }

  if (payload.carbs && (typeof payload.carbs !== 'number' || payload.carbs < 0 || payload.carbs > 1000)) {
    return { isValid: false, error: 'Invalid carbs value' };
  }

  if (payload.fat && (typeof payload.fat !== 'number' || payload.fat < 0 || payload.fat > 1000)) {
    return { isValid: false, error: 'Invalid fat value' };
  }

  return { isValid: true };
};

export const validateWebhookRequest = (url: string, data: any): FileValidationResult => {
  // Validate URL format
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'https:') {
      return { isValid: false, error: 'Webhook URL must use HTTPS' };
    }
  } catch {
    return { isValid: false, error: 'Invalid webhook URL format' };
  }

  // Validate data payload
  return validateWebhookPayload(data);
};

export const logSecurityEvent = (eventType: string, details: string, severity: 'low' | 'medium' | 'high' = 'low') => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    eventType,
    details,
    severity,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server'
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('Security Event:', logEntry);
  }

  // In production, you would send this to your logging service
  // For now, we'll store it in sessionStorage for debugging
  if (typeof window !== 'undefined') {
    try {
      const existingLogs = JSON.parse(sessionStorage.getItem('security_logs') || '[]');
      existingLogs.push(logEntry);
      // Keep only last 50 events
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      sessionStorage.setItem('security_logs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
};

export class RateLimiter {
  private attempts: Map<string, { count: number, resetTime: number }> = new Map();
  private maxAttempts: number;
  private timeWindow: number;

  constructor(maxAttempts: number, timeWindow: number) {
    this.maxAttempts = maxAttempts;
    this.timeWindow = timeWindow;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      // First attempt
      this.attempts.set(identifier, { count: 1, resetTime: now + this.timeWindow });
      return true;
    }

    if (now > record.resetTime) {
      // Time window expired, reset counter
      this.attempts.set(identifier, { count: 1, resetTime: now + this.timeWindow });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      // Too many attempts
      return false;
    }

    // Increment attempt count
    record.count++;
    this.attempts.set(identifier, record);
    return true;
  }

  getRemainingAttempts(identifier: string): number {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      return this.maxAttempts;
    }

    return Math.max(0, this.maxAttempts - record.count);
  }

  getTimeToReset(identifier: string): number {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      return 0;
    }

    return record.resetTime - now;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const validateUsername = (username: string): FileValidationResult => {
  if (!username || username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }

  if (username.length > 30) {
    return { isValid: false, error: 'Username must be less than 30 characters' };
  }

  // Only allow alphanumeric, underscore, and hyphen
  const validChars = /^[a-zA-Z0-9_-]+$/;
  if (!validChars.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  // Check for reserved usernames
  const reservedUsernames = [
    'admin', 'administrator', 'support', 'help', 'system',
    'user', 'profile', 'settings', 'login', 'logout',
    'signup', 'register', 'account', 'password', 'root'
  ];

  if (reservedUsernames.includes(username.toLowerCase())) {
    return { isValid: false, error: 'This username is reserved' };
  }

  return { isValid: true };
};

export const validateWebhookResponse = (response: any): FileValidationResult => {
  if (!response || typeof response !== 'object') {
    return { isValid: false, error: 'Invalid response format' };
  }

  // Validate required fields for food entries
  if (response.custom_food_name === undefined || response.calories_consumed === undefined) {
    return { isValid: false, error: 'Missing required food information' };
  }

  // Validate string fields
  if (typeof response.custom_food_name !== 'string' || response.custom_food_name.length === 0) {
    return { isValid: false, error: 'Invalid food name' };
  }

  // Validate numeric fields
  const numericFields = [
    'calories_consumed', 'protein_g_consumed', 
    'carbs_g_consumed', 'fat_g_consumed',
    'quantity_consumed'
  ];

  for (const field of numericFields) {
    if (response[field] !== undefined && 
        (typeof response[field] !== 'number' || 
         isNaN(response[field]) || 
         response[field] < 0)) {
      return { isValid: false, error: `Invalid ${field} value` };
    }
  }

  // Validate meal type
  const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack1', 'snack2'];
  if (response.meal_type && !validMealTypes.includes(response.meal_type)) {
    return { isValid: false, error: 'Invalid meal type' };
  }

  // Validate ingredients if present
  if (response.ingredients) {
    if (!Array.isArray(response.ingredients)) {
      return { isValid: false, error: 'Ingredients must be an array' };
    }

    for (const ingredient of response.ingredients) {
      if (typeof ingredient !== 'object' || !ingredient.name) {
        return { isValid: false, error: 'Invalid ingredient format' };
      }
    }
  }

  return { isValid: true };
};
