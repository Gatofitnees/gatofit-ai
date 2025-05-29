
// Input validation utilities for security
export const validateTextInput = (input: string, maxLength: number = 255): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters and trim
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .trim();
  
  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized;
};

export const validateNumericInput = (input: number | string, min: number = 0, max: number = 10000): number => {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num) || !isFinite(num)) return 0;
  if (num < min) return min;
  if (num > max) return max;
  
  return Math.round(num * 100) / 100; // Round to 2 decimal places
};

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Tipo de archivo no permitido. Use JPEG, PNG, WebP o GIF.' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'El archivo es demasiado grande. Máximo 10MB.' };
  }
  
  return { isValid: true };
};

export const sanitizeFoodName = (name: string): string => {
  return validateTextInput(name, 100);
};

export const sanitizeIngredientName = (name: string): string => {
  return validateTextInput(name, 50);
};

export const validateCalories = (calories: number | string): number => {
  return validateNumericInput(calories, 0, 5000);
};

export const validateMacronutrient = (macro: number | string): number => {
  return validateNumericInput(macro, 0, 1000);
};
