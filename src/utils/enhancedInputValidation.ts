
import DOMPurify from 'dompurify';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email es requerido' };
  }

  if (email.length > 320) {
    return { isValid: false, error: 'Email demasiado largo' };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /[<>'"]/,  // HTML/script injection
    /javascript:/i,  // JavaScript protocol
    /data:/i,  // Data protocol
    /vbscript:/i,  // VBScript protocol
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(email)) {
      return { isValid: false, error: 'Email contiene caracteres no válidos' };
    }
  }

  return { isValid: true, sanitizedValue: email.toLowerCase().trim() };
};

// Add alias for secure email validation
export const validateSecureEmail = validateEmail;

export const validateSecureUsername = (username: string): ValidationResult => {
  if (!username) {
    return { isValid: false, error: 'Nombre de usuario es requerido' };
  }

  if (username.length < 3) {
    return { isValid: false, error: 'Nombre de usuario debe tener al menos 3 caracteres' };
  }

  if (username.length > 30) {
    return { isValid: false, error: 'Nombre de usuario demasiado largo' };
  }

  // Allow only alphanumeric characters, underscores, and hyphens
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, error: 'Nombre de usuario contiene caracteres no válidos' };
  }

  return { isValid: true, sanitizedValue: username.trim() };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Contraseña es requerida' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'La contraseña es demasiado larga' };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'La contraseña debe contener al menos una letra mayúscula' };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'La contraseña debe contener al menos una letra minúscula' };
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'La contraseña debe contener al menos un número' };
  }

  // Check for at least one special character
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { isValid: false, error: 'La contraseña debe contener al menos un carácter especial' };
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', '12345678', 'qwerty123', 'password123', 
    'admin123', 'letmein123', 'welcome123', 'changeme123'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    return { isValid: false, error: 'Contraseña demasiado común, elige una más segura' };
  }

  return { isValid: true };
};

export const sanitizeTextInput = (input: string, maxLength: number = 1000): ValidationResult => {
  if (!input) {
    return { isValid: true, sanitizedValue: '' };
  }

  if (input.length > maxLength) {
    return { isValid: false, error: `Texto demasiado largo (máximo ${maxLength} caracteres)` };
  }

  // Sanitize HTML and remove dangerous scripts
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });

  return { isValid: true, sanitizedValue: sanitized.trim() };
};

export const validateImageFile = (file: File): ValidationResult => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!file) {
    return { isValid: false, error: 'Archivo es requerido' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'Archivo demasiado grande (máximo 10MB)' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Tipo de archivo no permitido (solo JPG, PNG, WebP)' };
  }

  // Check file name for suspicious patterns
  const suspiciousPatterns = [
    /\.php$/i, /\.js$/i, /\.html$/i, /\.exe$/i, /\.bat$/i, /\.cmd$/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      return { isValid: false, error: 'Nombre de archivo no válido' };
    }
  }

  return { isValid: true };
};

export const validateNumericInput = (value: string, min?: number, max?: number): ValidationResult => {
  if (!value) {
    return { isValid: false, error: 'Valor es requerido' };
  }

  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return { isValid: false, error: 'Debe ser un número válido' };
  }

  if (min !== undefined && numValue < min) {
    return { isValid: false, error: `Valor mínimo: ${min}` };
  }

  if (max !== undefined && numValue > max) {
    return { isValid: false, error: `Valor máximo: ${max}` };
  }

  return { isValid: true, sanitizedValue: numValue.toString() };
};

export const validateUrl = (url: string): ValidationResult => {
  if (!url) {
    return { isValid: true, sanitizedValue: '' };
  }

  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Solo se permiten URLs HTTP/HTTPS' };
    }

    return { isValid: true, sanitizedValue: url };
  } catch {
    return { isValid: false, error: 'URL no válida' };
  }
};
